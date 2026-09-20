import { createHash } from 'node:crypto';
import { ForgotPasswordSchema, ResetPasswordSchema, type ForgotPasswordInput, type ResetPasswordInput } from '@/contracts/auth';
import { db } from '@/server/db';
import { hashPassword } from 'better-auth/crypto';
import { sendVerificationEmail } from '@/server/email/service';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function generateSixDigitCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

export class RecoveryError extends Error {
  readonly status = 422;
  readonly fieldErrors?: Record<string, string[]>;
  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export class TokenNotFoundError extends Error {
  readonly status = 404;
  constructor() {
    super('Token not found or expired');
  }
}

export async function requestPasswordReset(input: unknown): Promise<{ success: boolean }> {
  const parsed = ForgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.');
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    throw new RecoveryError('Validation failed', fieldErrors);
  }

  const { email } = parsed.data;

  // Always return success to prevent email enumeration
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return { success: true };
  }

  const code = generateSixDigitCode();
  const hashedCode = hashToken(code);
  const identifier = `reset:${user.id}`;
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await db.verification.deleteMany({ where: { identifier } });

  await db.verification.create({
    data: {
      identifier,
      value: hashedCode,
      expiresAt,
    },
  });

  await sendVerificationEmail(email, code, 'password-reset');

  return { success: true };
}

export async function resetPassword(input: unknown): Promise<{ success: boolean }> {
  const parsed = ResetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.');
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    throw new RecoveryError('Validation failed', fieldErrors);
  }

  const { token, newPassword } = parsed.data;
  const hashedToken = hashToken(token.trim());

  // Find all reset tokens and check
  const verifications = await db.verification.findMany({
    where: { identifier: { startsWith: 'reset:' } },
  });

  let validVerification = null;
  let userId = null;

  for (const v of verifications) {
    if (v.value === hashedToken && v.expiresAt >= new Date()) {
      validVerification = v;
      userId = v.identifier.replace('reset:', '');
      break;
    }
  }

  if (!validVerification || !userId) {
    throw new TokenNotFoundError();
  }

  // Delete the token
  await db.verification.delete({ where: { id: validVerification.id } });

  // Update password with Better Auth's own hasher (scrypt), so signInEmail can verify it.
  const account = await db.account.findFirst({
    where: { userId, providerId: 'credential' },
  });

  if (account) {
    const passwordHash = await hashPassword(newPassword);
    await db.account.update({
      where: { id: account.id },
      data: { password: passwordHash },
    });
  }

  // Revoke all sessions for this user (effective logout everywhere).
  await db.session.deleteMany({ where: { userId } });

  return { success: true };
}
