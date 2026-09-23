import { beforeEach, describe, expect, it, vi } from 'vitest';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock('@/server/db', () => ({
  db: { $queryRawUnsafe: query },
}));

import { GET, getHealthStatus } from '@/app/api/health/route';

describe('health endpoint', () => {
  beforeEach(() => query.mockReset());

  it('reports ready only after the database answers a query', async () => {
    query.mockResolvedValue([{ connected: 1 }]);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'ok', database: 'ready' });
  });

  it('reports unavailable when the database cannot answer', async () => {
    await expect(getHealthStatus(async () => {
      throw new Error('database unavailable');
    })).resolves.toEqual({ status: 'unavailable', database: 'unavailable' });
  });
});
