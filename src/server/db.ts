import { PrismaClient } from '@prisma/client';
import { PrismaNeonHttp } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, { fullResults: true });
  const client = new PrismaClient({ adapter });

  // Neon HTTP driver has no server-side transactions. Prisma's $transaction
  // would throw here, so run the work sequentially instead. This is NOT atomic:
  // callers that need exactly-once semantics must rely on unique constraints
  // (e.g. IdempotencyRecord @@unique, Draft @@unique userId) and treat
  // P2002/conflict errors as the source of truth. See docs/architecture.
  let warned = false;
  (client as any).$transaction = async (fn: (tx: any) => Promise<any>) => {
    if (!warned) {
      warned = true;
      console.warn('[DB] $transaction is emulated sequentially on Neon HTTP: not atomic, unique constraints are authoritative.');
    }
    return fn(client);
  };

  return client;
}

export const db = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
