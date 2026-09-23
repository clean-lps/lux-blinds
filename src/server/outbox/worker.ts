import { randomUUID } from 'node:crypto';
import { db } from '@/server/db';
import { dispatchOutboxEvent } from '@/server/outbox/providers';

const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 60 * 1000;

export async function enqueueOutbox(channel: string, payload: unknown): Promise<string> {
  const row = await db.outbox.create({
    data: {
      eventId: randomUUID(),
      channel,
      payload: payload as object,
      status: 'pending',
      attempts: 0,
      nextAttemptAt: new Date(),
    },
  });
  return row.id;
}

export async function processOutboxBatch(now = new Date()) {
  const rows = await db.outbox.findMany({
    where: { status: { in: ['pending', 'processing'] }, nextAttemptAt: { lte: now } },
    take: 50,
    orderBy: { nextAttemptAt: 'asc' },
  });

  let processed = 0;
  let failed = 0;
  for (const row of rows) {
    const claimed = await db.outbox.updateMany({ where: { id: row.id, status: row.status, nextAttemptAt: { lte: now } }, data: { status: 'processing', nextAttemptAt: new Date(Date.now() + 300000) } });
    if (!claimed.count) continue;
    try {
      await dispatchOutboxEvent(row.channel, row.payload);
      await db.outbox.update({
        where: { id: row.id },
        data: { status: 'sent', attempts: { increment: 1 } },
      });
      processed++;
    } catch (err: any) {
      failed++;
      const attempts = row.attempts + 1;
      const exhausted = attempts >= MAX_ATTEMPTS;
      await db.outbox.update({
        where: { id: row.id },
        data: {
          status: exhausted ? 'failed' : 'pending',
          attempts,
          nextAttemptAt: new Date(Date.now() + BASE_DELAY_MS * 2 ** row.attempts),
          lastErrorCode: String(err?.message ?? err).slice(0, 200),
        },
      });
    }
  }
  return { processed, failed };
}
