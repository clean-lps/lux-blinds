import { NextResponse } from 'next/server';
import { OrderQuerySchema } from '@/contracts';
import { requireActor } from '@/server/auth/session';
import { AdminOrderError, listAdminOrders } from '@/server/admin/orders';

export async function GET(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  const query = OrderQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!query.success) {
    return NextResponse.json({ error: { code: 'INVALID_INPUT', message: 'Invalid request', retryable: false }, requestId }, { status: 400 });
  }
  try {
    return NextResponse.json({ ...(await listAdminOrders(await requireActor(request), query.data)), requestId });
  } catch (error) {
    const status = error instanceof AdminOrderError ? error.status : 401;
    return NextResponse.json(
      { error: { code: status === 403 ? 'FORBIDDEN' : 'UNAUTHORIZED', message: status === 403 ? 'Forbidden' : 'Authentication required', retryable: false }, requestId },
      { status },
    );
  }
}
