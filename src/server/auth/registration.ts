import { createHash } from 'node:crypto';
import { RegisterSchema, VerifySchema, type RegisterInput, type ChallengeDTO, type SafeUser } from '@/contracts/auth';
import { db } from '@/server/db';
import { auth } from '@/server/auth/session';
import { symmetricDecrypt, symmetricEncrypt } from 'better-auth/crypto';
import { sendVerificationEmail, isMockProvider } from '@/server/email/service';

const CODE_LENGTH = 6;
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute
const MAX_CODE_ATTEMPTS = 5;

type PendingRegistration = {
  codeHash: string;
  passwordEnc?: string;
  password?: string;
  registrationData: any;
  attempts?: number;
  resendAfter?: string;
};

function generateCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function pendingSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new RegistrationError('Server is missing BETTER_AUTH_SECRET');
  return secret;
}

async function sealPassword(plain: string): Promise<string> {
  return symmetricEncrypt({ key: pendingSecret(), data: plain });
}

async function openPassword(sealed: string): Promise<string> {
  try {
    return await symmetricDecrypt({ key: pendingSecret(), data: sealed });
  } catch {
    throw new RegistrationError('Verification data is outdated. Please register again.');
  }
}

/** Delete a half-created account (user + credential + sessions) so verification can be retried. */
async function deleteOrphanUser(userId: string): Promise<void> {
  await db.session.deleteMany({ where: { userId } });
  await db.account.deleteMany({ where: { userId } });
  await db.membership.deleteMany({ where: { userId } });
  await db.user.deleteMany({ where: { id: userId } });
}

function maskDestination(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***';
  if (local.length <= 2) return `**@${domain}`;
  return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

export class RegistrationError extends Error {
  readonly status = 422;
  readonly fieldErrors?: Record<string, string[]>;
  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export class ChallengeNotFoundError extends Error {
  readonly status = 404;
  constructor() {
    super('Challenge not found');
  }
}

export class ChallengeExpiredError extends Error {
  readonly status = 410;
  constructor() {
    super('Challenge expired');
  }
}

export class CodeInvalidError extends Error {
  readonly status = 422;
  constructor() {
    super('Invalid verification code');
  }
}

export class CodeUsedError extends Error {
  readonly status = 422;
  constructor() {
    super('Code already used');
  }
}

export class ChallengeRateLimitError extends Error {
  readonly status = 429;
  constructor(message = 'Please wait before trying again') {
    super(message);
  }
}

function parsePendingRegistration(value: string): PendingRegistration {
  try {
    const parsed = JSON.parse(value) as PendingRegistration;
    if (!parsed?.codeHash || !parsed?.registrationData || (!parsed.passwordEnc && !parsed.password)) {
      throw new Error('incomplete');
    }
    return parsed;
  } catch {
    throw new RegistrationError('Verification data is outdated. Please register again.');
  }
}

function isCoolingDown(value: PendingRegistration, now = new Date()): boolean {
  return !!value.resendAfter && new Date(value.resendAfter) > now;
}

export async function registerPendingUser(input: unknown): Promise<ChallengeDTO> {
  const parsed = RegisterSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.');
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    throw new RegistrationError('Validation failed', fieldErrors);
  }

  const data = parsed.data;

  const existing = await db.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) {
    throw new RegistrationError('Email already registered');
  }

  const code = generateCode();
  const identifier = `register:${data.email.toLowerCase()}`;
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);
  const resendAfter = new Date(Date.now() + RESEND_COOLDOWN_MS);

  const existingChallenge = await db.verification.findFirst({ where: { identifier } });
  if (existingChallenge && existingChallenge.expiresAt > new Date()) {
    const existingValue = parsePendingRegistration(existingChallenge.value);
    if (isCoolingDown(existingValue)) throw new ChallengeRateLimitError();
  }

  const registrationData = {
    email: data.email,
    companyName: data.companyName,
    contactName: data.contactName,
    phone: data.phone,
    taxId: data.taxId,
    taxExempt: data.taxExempt,
    certificateId: data.certificateId,
    termsVersion: data.termsVersion,
    verificationMethod: 'email',
    smsConsent: false,
  };

  const value = JSON.stringify({
    codeHash: hashValue(code),
    passwordEnc: await sealPassword(data.password),
    registrationData,
    attempts: 0,
    resendAfter: resendAfter.toISOString(),
  });

  await db.verification.deleteMany({ where: { identifier } });

  await db.verification.create({
    data: {
      identifier,
      value,
      expiresAt,
    },
  });

  await sendVerificationEmail(data.email, code, 'registration');

  const masked = maskDestination(data.email);

  const result: ChallengeDTO = {
    challengeId: identifier,
    expiresAt: expiresAt.toISOString(),
    resendAfter: resendAfter.toISOString(),
    maskedDestination: masked,
  };
  if (isMockProvider()) {
    result.devCode = code;
  }
  return result;
}

export async function verifyChallenge(input: unknown): Promise<SafeUser> {
  const parsed = VerifySchema.safeParse(input);
  if (!parsed.success) {
    throw new CodeInvalidError();
  }

  const { challengeId, code } = parsed.data;

  const verification = await db.verification.findFirst({
    where: { identifier: challengeId },
  });

  if (!verification) throw new ChallengeNotFoundError();
  if (verification.expiresAt < new Date()) throw new ChallengeExpiredError();

  const parsedValue = parsePendingRegistration(verification.value);

  const { codeHash, registrationData } = parsedValue;
  // Backward compatibility: challenges created before encryption stored `password` in clear.
  const password = parsedValue.passwordEnc ? await openPassword(parsedValue.passwordEnc) : parsedValue.password;
  if (!password) {
    throw new RegistrationError('Verification data is incomplete. Please register again.');
  }

  if ((parsedValue.attempts ?? 0) >= MAX_CODE_ATTEMPTS) {
    throw new ChallengeRateLimitError('Too many invalid verification attempts. Please request a new code.');
  }
  if (hashValue(code) !== codeHash) {
    await db.verification.update({
      where: { id: verification.id },
      data: { value: JSON.stringify({ ...parsedValue, attempts: (parsedValue.attempts ?? 0) + 1 }) },
    });
    throw new CodeInvalidError();
  }

  const email = registrationData.email.toLowerCase();

  await db.verification.delete({ where: { id: verification.id } });

  let userId: string;
  try {
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: registrationData.contactName || email.split('@')[0],
      },
      headers: new Headers(),
    });

    userId = signUpResult.user.id;
  } catch (signUpError: any) {
    // Reconcile half-created accounts: if a previous attempt created the user
    // but never attached an organization, remove the orphan so this retry can proceed.
    const orphan = await db.user.findUnique({ where: { email } });
    if (orphan) {
      const membership = await db.membership.findFirst({ where: { userId: orphan.id }, select: { id: true } });
      if (!membership) {
        await deleteOrphanUser(orphan.id);
        try {
          const retry = await auth.api.signUpEmail({
            body: {
              email,
              password,
              name: registrationData.contactName || email.split('@')[0],
            },
            headers: new Headers(),
          });
          userId = retry.user.id;
        } catch (retryError: any) {
          throw new RegistrationError('Failed to create account. Please try again.');
        }
      } else {
        throw new RegistrationError('Email already registered');
      }
    } else {
      throw new RegistrationError('Failed to create account. Please try again.');
    }
  }

  try {
    await db.$executeRawUnsafe(`UPDATE "User" SET "emailVerified" = true, "role" = 'client' WHERE id = $1`, userId);

    await db.$executeRawUnsafe(`UPDATE "Account" SET "accountId" = $1 WHERE "userId" = $1 AND "providerId" = 'credential'`, userId);

    const orgId = crypto.randomUUID();
    await db.$executeRawUnsafe(
      `INSERT INTO "Organization" (id, "companyName", "contactName", phone, address, "taxId", "taxStatus", revision, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, 1, NOW())`,
      orgId,
      registrationData.companyName || 'Unknown Company',
      registrationData.contactName || 'Unknown Contact',
      registrationData.phone || '0000000000',
      registrationData.address || '',
      registrationData.taxId || null,
      'pending'
    );

    await db.$executeRawUnsafe(
      `INSERT INTO "Membership" (id, "userId", "organizationId") VALUES ($1, $2, $3)`,
      crypto.randomUUID(), userId, orgId
    );
  } catch (postError: any) {
    console.error('[VERIFY ERROR] account setup failed');
    // Never report success when org/membership are missing: the account would be
    // unable to pass requireActor. Compensate and surface a retryable error.
    try {
      await deleteOrphanUser(userId!);
    } catch {
      // Best effort cleanup; the orphan reconciler above covers the retry path.
    }
    throw new RegistrationError('Failed to finish account setup. Please try again.');
  }

  return {
    id: userId!,
    email,
    name: registrationData.contactName || email.split('@')[0],
    role: 'client',
    verified: true,
  };
}

export async function resendChallenge(identifier: string): Promise<ChallengeDTO> {
  const verification = await db.verification.findFirst({
    where: { identifier },
  });

  if (!verification) throw new ChallengeNotFoundError();

  // Preserve whichever credential envelope the challenge was created with.
  const parsedValue = parsePendingRegistration(verification.value);
  if (isCoolingDown(parsedValue)) throw new ChallengeRateLimitError();

  const { registrationData } = parsedValue;
  const newCode = generateCode();
  const newExpiresAt = new Date(Date.now() + CODE_TTL_MS);
  const resendAfter = new Date(Date.now() + RESEND_COOLDOWN_MS);

  const newValue = JSON.stringify({
    codeHash: hashValue(newCode),
    ...(parsedValue.passwordEnc ? { passwordEnc: parsedValue.passwordEnc } : { password: parsedValue.password }),
    registrationData,
    attempts: 0,
    resendAfter: resendAfter.toISOString(),
  });

  await db.verification.update({
    where: { id: verification.id },
    data: {
      value: newValue,
      expiresAt: newExpiresAt,
    },
  });

  const email = registrationData.email;

  await sendVerificationEmail(email, newCode, 'registration');

const result: ChallengeDTO = {
      challengeId: identifier,
      expiresAt: newExpiresAt.toISOString(),
      resendAfter: resendAfter.toISOString(),
      maskedDestination: maskDestination(registrationData.email),
   };
   if (isMockProvider()) {
      result.devCode = newCode;
   }
   return result;
}

export async function getPendingEmail(identifier: string): Promise<{ email: string } | null> {
  if (!identifier.startsWith('register:')) return null;
  const email = identifier.replace('register:', '');
  const verification = await db.verification.findFirst({
    where: { identifier },
  });
  if (!verification) return null;
  return { email };
}
