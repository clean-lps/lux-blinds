import { describe, expect, it, vi } from 'vitest';
import { createAdminApi } from '@/components/admin/admin-api';
import { createOrderDetailApi } from '@/components/admin/order-detail-api';

function jsonResponse() {
  return new Response(JSON.stringify({ data: [], page: { nextCursor: null }, requestId: 'test' }), { status: 200 });
}

describe('admin API client', () => {
  it('uses the staff-only order collection endpoint', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse());

    await createAdminApi(fetcher).listOrders({ limit: 20 });

    expect(fetcher).toHaveBeenCalledWith('/api/v1/admin/orders?limit=20', expect.any(Object));
  });

  it('uses the staff-only order detail endpoint', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: {}, requestId: 'test' }), { status: 200 }));

    await createOrderDetailApi(fetcher).getOrder('order-1');

    expect(fetcher).toHaveBeenCalledWith('/api/v1/admin/orders/order-1', expect.any(Object));
  });
});
