import { db } from '../src/server/db';

async function main() {
  await db.$transaction(async tx => {
    await tx.$queryRaw`SELECT 1`;
    await tx.user.count();
    await tx.order.count();
  }, { timeout: 20000 });
  console.log('Database connection, application tables and real transaction: OK');
}
main().catch(() => { console.error('Database verification failed. Check connectivity, DATABASE_URL and migrations.'); process.exitCode = 1; }).finally(() => db.$disconnect());
