export function emailProvider(): string {
  return process.env.EMAIL_PROVIDER?.trim() || (process.env.RESEND_API_KEY ? 'resend' : 'mock');
}
