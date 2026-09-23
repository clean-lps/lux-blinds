import type { Actor } from '@/contracts/auth';
import type { UpdateProfileInput, ProfileDTO } from '@/contracts/profile';
import { UpdateProfileSchema } from '@/contracts/profile';
import { db } from '@/server/db';
import { hashPassword, verifyPassword } from 'better-auth/crypto';
import { createHash } from 'node:crypto';
import { sendTransactionalEmail, verificationCodeHtml, isMockProvider } from '@/server/email/service';

const EMAIL_CHANGE_TTL_MS = 60 * 60 * 1000; // 1 hour

export class ProfileError extends Error {
  readonly status = 422;
  readonly fieldErrors?: Record<string, string[]>;
  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export class ProfileConflictError extends Error {
  readonly status = 409;
  constructor() {
    super('Profile has been modified. Please refresh and try again.');
  }
}

export async function getProfile(actor: Actor): Promise<ProfileDTO> {
  const membership = await db.membership.findFirst({
    where: { userId: actor.userId },
    include: { organization: true },
  });

  if (!membership) throw new Error('No organization found');

  const user = await db.user.findUniqueOrThrow({ where: { id: actor.userId } });
  const org = membership.organization;

  const consent = await db.consent.findFirst({
    where: { userId: actor.userId, channel: 'sms' },
    orderBy: { recordedAt: 'desc' },
  });

  return {
    id: org.id,
    revision: org.revision,
    companyName: org.companyName,
    contactName: org.contactName,
    phone: org.phone,
    address: org.address,
    email: user.email,
    emailVerified: user.emailVerified,
    smsConsent: consent?.granted ?? false,
    taxStatus: org.taxStatus as 'pending' | 'approved' | 'rejected',
    certificateId: (await db.attachment.findFirst({ where: { organizationId: org.id, purpose: 'tax_certificate', uploadStatus: 'uploaded', scanStatus: 'clean' }, orderBy: { createdAt: 'desc' }, select: { id: true } }))?.id ?? null,
  };
}

export async function updateProfile(actor: Actor, input: unknown): Promise<ProfileDTO> {
  const parsed = UpdateProfileSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.');
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    throw new ProfileError('Validation failed', fieldErrors);
  }

  const data = parsed.data;
  const membership = await db.membership.findFirst({
    where: { userId: actor.userId },
    include: { organization: true },
  });

  if (!membership) throw new Error('No organization found');

  const org = membership.organization;

  if (org.revision !== data.expectedVersion) {
    throw new ProfileConflictError();
  }

  const updated = await db.organization.updateMany({
    where: { id: org.id, revision: data.expectedVersion },
    data: {
      companyName: data.companyName,
      contactName: data.contactName,
      phone: data.phone,
      address: data.address,
      revision: { increment: 1 },
    },
  });

  if (!updated.count) throw new ProfileConflictError();
  return getProfile(actor);
}

export async function changeEmail(actor: Actor, newEmail: string): Promise<{ success: boolean; devCode?: string }> {
  const normalized = newEmail.toLowerCase();
  const existing = await db.user.findUnique({ where: { email: normalized } });
  if (existing && existing.id !== actor.userId) {
    throw new ProfileError('Email already in use');
  }

  let code = '';
  for (let i = 0; i < 6; i++) code += Math.floor(Math.random() * 10).toString();
  const identifier = `email-change:${actor.userId}:${normalized}`;
  await db.verification.deleteMany({ where: { identifier } });
  await db.verification.create({
    data: {
      identifier,
      value: createHash('sha256').update(code).digest('hex'),
      expiresAt: new Date(Date.now() + EMAIL_CHANGE_TTL_MS),
    },
  });

  await sendTransactionalEmail(
    normalized,
    'Confirm your new LUX Blinds email',
    verificationCodeHtml('Confirm your new email', 'Use the code below to confirm your new email address:', code, 60),
  );

  console.log(`[PROFILE] Email change requested for ${actor.userId} -> ${normalized}`);
  return isMockProvider() ? { success: true, devCode: code } : { success: true };
}

export async function verifyChangedEmail(actor: Actor, newEmail: string, code: string): Promise<{ success: boolean }> {
  const normalized = newEmail.toLowerCase();
  const identifier = `email-change:${actor.userId}:${normalized}`;
  const verification = await db.verification.findFirst({ where: { identifier } });
  if (!verification || verification.expiresAt < new Date()) {
    throw new ProfileError('Verification code expired. Request a new one.');
  }
  if (verification.value !== createHash('sha256').update(code.trim()).digest('hex')) {
    throw new ProfileError('Invalid verification code');
  }

  const taken = await db.user.findUnique({ where: { email: normalized } });
  if (taken && taken.id !== actor.userId) {
    throw new ProfileError('Email already in use');
  }

  await db.verification.delete({ where: { id: verification.id } });
  await db.user.update({
    where: { id: actor.userId },
    data: { email: normalized, emailVerified: true },
  });
  return { success: true };
}

export async function changePassword(actor: Actor, currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
  const account = await db.account.findFirst({
    where: { userId: actor.userId, providerId: 'credential' },
  });

  if (!account?.password) throw new ProfileError('No password account found');

  const valid = await verifyPassword({ hash: account.password, password: currentPassword });
  if (!valid) {
    throw new ProfileError('Current password is incorrect');
  }

  await db.account.update({
    where: { id: account.id },
    data: { password: await hashPassword(newPassword) },
  });

  // Revoke other sessions so the password change takes effect everywhere.
  await db.session.deleteMany({ where: { userId: actor.userId } });

  return { success: true };
}

export async function recordConsent(actor: Actor, channel: string, granted: boolean, wordingVersion: string): Promise<{ success: boolean }> {
  await db.consent.create({
    data: {
      userId: actor.userId,
      channel,
      granted,
      wordingVersion,
      source: 'user',
    },
  });

  return { success: true };
}
