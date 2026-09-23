import { beforeEach, describe, expect, it, vi } from 'vitest';

const { signInEmail } = vi.hoisted(() => ({ signInEmail: vi.fn() }));

vi.mock('@/server/auth/session', () => ({
  auth: { api: { signInEmail } },
}));

import { POST } from '@/app/api/v1/auth/login/route';

describe('login endpoint', () => {
  beforeEach(() => {
    signInEmail.mockReset();
  });

  it('reports an unavailable authentication service when the database schema is missing', async () => {
    signInEmail.mockRejectedValue(Object.assign(new Error('The table `User` does not exist'), { code: 'P2021' }));

    const response = await POST(new Request('http://localhost/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.test', password: 'not-a-real-password' }),
    }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'DATABASE_UNAVAILABLE', retryable: true },
    });
  });
});
