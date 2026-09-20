// Effective integration state is resolved from env at runtime (see each service).
// email: resend when RESEND_API_KEY is set, otherwise mock log.
// sms: twilio when SMS_ENABLED=true + TWILIO_* set; disabled otherwise.
// storage: s3 presigned URLs when STORAGE_PROVIDER=s3 + credentials; local-test otherwise.
// av: clamav daemon when AV_PROVIDER=clamav; deterministic local gate otherwise.
export const integrationPolicy = Object.freeze({
  email: process.env.RESEND_API_KEY ? 'resend' : 'mock',
  sms: process.env.SMS_ENABLED === 'true' ? 'twilio' : 'disabled',
  smsEnabled: process.env.SMS_ENABLED === 'true',
  storage: process.env.STORAGE_PROVIDER === 's3' ? 's3' : 'local-test',
  av: process.env.AV_PROVIDER === 'clamav' ? 'clamav' : 'local-gate',
} as const);
