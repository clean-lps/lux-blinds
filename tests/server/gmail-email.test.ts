import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ sendMail: vi.fn(), createTransport: vi.fn(), resend: vi.fn() }));
vi.mock('nodemailer', () => ({ default: { createTransport: mocks.createTransport } }));
vi.mock('resend', () => ({ Resend: class { emails = { send: mocks.resend }; } }));
beforeEach(() => {
  vi.resetModules(); vi.clearAllMocks();
  vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('EMAIL_PROVIDER', 'gmail');
  vi.stubEnv('RESEND_API_KEY', 're_unused');
  vi.stubEnv('GMAIL_USER', 'project@gmail.com');
  vi.stubEnv('GMAIL_APP_PASSWORD', 'abcd efgh ijkl mnop');
  mocks.createTransport.mockReturnValue({ sendMail: mocks.sendMail });
  mocks.sendMail.mockResolvedValue({ messageId: 'smtp-1', accepted: ['client@example.com'], rejected: [] });
});
afterEach(() => vi.unstubAllEnvs());
it('sends verification and recovery via Gmail even with a Resend key present', async () => {
  const service = await import('@/server/email/service');
  for (const type of ['registration', 'password-reset'] as const) {
    await expect(service.sendVerificationEmail('client@example.com', '123456', type)).resolves.toEqual({ id: 'smtp-1', provider: 'gmail' });
  }
  expect(service.isMockProvider()).toBe(false);
  expect(mocks.resend).not.toHaveBeenCalled();
  expect(mocks.createTransport).toHaveBeenCalledWith(expect.objectContaining({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: 'project@gmail.com', pass: 'abcdefghijklmnop' } }));
  expect(mocks.sendMail).toHaveBeenCalledWith(expect.objectContaining({ from: { name: 'LUX Blinds', address: 'project@gmail.com' }, to: 'client@example.com', html: expect.stringContaining('123456') }));
});
it('uses Gmail for transactional emails too', async () => {
  const { sendTransactionalEmail } = await import('@/server/email/service');
  await expect(sendTransactionalEmail('client@example.com', 'Order update', '<p>Ready</p>')).resolves.toEqual({ id: 'smtp-1', provider: 'gmail' });
});
it('does not fall back when Gmail credentials are missing', async () => {
  vi.stubEnv('GMAIL_APP_PASSWORD', '');
  const { sendVerificationEmail } = await import('@/server/email/service');
  await expect(sendVerificationEmail('client@example.com', '123456', 'registration')).rejects.toThrow('Email provider is not configured');
  expect(mocks.resend).not.toHaveBeenCalled();
});
it('sanitizes SMTP failures without exposing credentials', async () => {
  mocks.sendMail.mockRejectedValue(new Error('secret SMTP details'));
  const { sendVerificationEmail } = await import('@/server/email/service');
  await expect(sendVerificationEmail('client@example.com', '123456', 'registration')).rejects.toThrow('Email delivery failed. Please retry.');
});
it('rejects SMTP responses that do not accept the recipient', async () => {
  mocks.sendMail.mockResolvedValue({ messageId: 'smtp-2', accepted: [], rejected: ['client@example.com'] });
  const { sendVerificationEmail } = await import('@/server/email/service');
  await expect(sendVerificationEmail('client@example.com', '123456', 'registration')).rejects.toThrow('Email delivery failed');
});
