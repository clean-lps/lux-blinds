import { beforeEach, describe, expect, it, vi } from 'vitest';

const { registerPendingUser } = vi.hoisted(() => ({ registerPendingUser: vi.fn() }));

vi.mock('@/server/auth/registration', () => ({
  registerPendingUser,
  RegistrationError: class RegistrationError extends Error {},
}));

import { POST } from '@/app/api/v1/auth/register/route';

describe('registration endpoint', () => {
  beforeEach(() => {
    registerPendingUser.mockReset();
  });

  it('never writes a registration body or password to application logs', async () => {
    registerPendingUser.mockResolvedValue({ challengeId: 'register:test@example.test' });
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const response = await POST(new Request('http://localhost/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.test', password: 'not-for-logs' }),
    }));

    expect(response.status).toBe(201);
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
