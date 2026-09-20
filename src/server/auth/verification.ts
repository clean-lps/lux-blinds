import { db } from '@/server/db';
import { createHash, randomBytes } from 'node:crypto';

const CHALLENGE_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export class VerificationError extends Error {
  readonly status = 422;
  constructor(message: string) {
    super(message);
  }
}

export async function createVerificationChallenge(userId: string, type: 'email' | 'phone', destination: string): Promise<{ token: string; expiresAt: Date }> {
  const rawToken = randomBytes(32).toString('hex');
  const hashedToken = hashToken(rawToken);
  const identifier = `verify:${type}:${userId}:${destination}`;
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);

  await db.verification.deleteMany({ where: { identifier } });

  await db.verification.create({
    data: {
      identifier,
      value: hashedToken,
      expiresAt,
    },
  });

  return { token: rawToken, expiresAt };
}

export async function verifyUserChallenge(userId: string, token: string, destination: string): Promise<boolean> {
  const identifier = `verify:email:${userId}:${destination}`;

  const verification = await db.verification.findFirst({
    where: { identifier },
  });

  if (!verification) return false;
  if (verification.expiresAt < new Date()) return false;

  const tokenHash = hashToken(token);
  if (verification.value !== tokenHash) return false;

  await db.verification.delete({ where: { id: verification.id } });

  await db.user.update({
    where: { id: userId },
    data: { emailVerified: true },
  });

  return true;
}
