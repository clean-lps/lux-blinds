import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { RoleSchema, type Actor } from '@/contracts/auth';
import { db } from '@/server/db';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.APP_ORIGIN,
  database: prismaAdapter(db, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },
  user: {
    additionalFields: {
      // Prisma owns the default (client); callers cannot mass-assign a role.
      role: { type: 'string', required: false, input: false },
    },
  },
});

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor() {
    super('Authentication required');
  }
}

export async function requireActor(request: Pick<Request, 'headers'>): Promise<Actor> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw new UnauthorizedError();

  const role = RoleSchema.safeParse(session.user.role);
  if (!role.success) throw new UnauthorizedError();

  const membership = await db.membership.findFirst({
    where: { userId: session.user.id },
    select: { organizationId: true },
  });
  if (!membership) throw new UnauthorizedError();

  return { userId: session.user.id, organizationId: membership.organizationId, role: role.data };
}
