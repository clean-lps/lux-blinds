// Effective integration state is resolved from env at runtime (see each service).
import { emailProvider } from '../email/provider';
// email: explicit provider; legacy fallback uses Resend when its key is set.
// sms: twilio when SMS_ENABLED=true + TWILIO_* set; disabled otherwise.
// storage: s3 presigned URLs when STORAGE_PROVIDER=s3 + credentials; local-test otherwise.
// av: clamav daemon when AV_PROVIDER=clamav; deterministic local gate otherwise.
export const integrationPolicy = Object.freeze({
  email: emailProvider(),
  sms: process.env.SMS_ENABLED === 'true' ? 'twilio' : 'disabled',
  smsEnabled: process.env.SMS_ENABLED === 'true',
  storage: process.env.STORAGE_PROVIDER === 's3' ? 's3' : 'local-test',
  av: process.env.AV_PROVIDER === 'clamav' ? 'clamav' : 'local-gate',
} as const);
