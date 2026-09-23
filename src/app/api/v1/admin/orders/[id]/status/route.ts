import { after, NextResponse } from 'next/server';
import { requireActor, UnauthorizedError } from '@/server/auth/session';
import { changeStatus, AdminOrderError } from '@/server/admin/orders';
import { processOutboxBatch } from '@/server/outbox/worker';
export async function POST(r: Request, c: { params: Promise<{ id: string }> }) {
  const requestId = crypto.randomUUID();
  try {
    const data = await changeStatus(await requireActor(r), (await c.params).id, await r.json());
    after(async () => { await processOutboxBatch(); });
    return NextResponse.json({ data, requestId });
  } catch (error) {
    const status = error instanceof AdminOrderError ? error.status : error instanceof UnauthorizedError ? 401 : error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json({ error: { code: status === 409 ? 'CONFLICT' : status === 422 ? 'INVALID_INPUT' : 'REQUEST_FAILED', message: 'Unable to change status', retryable: status >= 500 }, requestId }, { status });
  }
}
