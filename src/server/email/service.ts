import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_EMAIL_FROM ?? 'LUX Blinds <onboarding@resend.dev>';

let resendClient: Resend | null = null;

function getClient(): Resend {
  if (!resendClient && resendApiKey) {
    resendClient = new Resend(resendApiKey);
  }
  return resendClient!;
}

export interface SendEmailResult {
  id: string;
  provider: 'resend' | 'mock';
}

export async function sendVerificationEmail(
  to: string,
  code: string,
  type: 'registration' | 'password-reset'
): Promise<SendEmailResult> {
  const subject = type === 'registration'
    ? 'Verify your LUX Blinds account'
    : 'Reset your LUX Blinds password';

  const html = buildVerificationHtml(code, type);

  if (resendApiKey) {
    try {
      const client = getClient();
      const result = await client.emails.send({
        from: fromAddress,
        to: [to],
        subject,
        html,
      });
      if (result.error || !result.data?.id) throw new Error('Email provider rejected delivery');
      console.log(`[EMAIL] Sent ${type} code to ${to} via Resend (id: ${result.data?.id})`);
      return { id: result.data?.id ?? 'unknown', provider: 'resend' };
    } catch (err) {
      throw new Error('Email delivery failed. Please retry.');
    }
  }

  if (process.env.NODE_ENV === 'production') throw new Error('Email provider is not configured');
  console.log(`[EMAIL:MOCK] ${type} code for ${to}: ${code}`);
  return { id: `mock-${Date.now()}`, provider: 'mock' };
}

export async function sendTransactionalEmail(to: string, subject: string, html: string): Promise<SendEmailResult> {
  if (resendApiKey) {
    try {
      const client = getClient();
      const result = await client.emails.send({ from: fromAddress, to: [to], subject, html });
      if (result.error || !result.data?.id) throw new Error('Email provider rejected delivery');
      console.log(`[EMAIL] Sent "${subject}" to ${to} via Resend (id: ${result.data?.id})`);
      return { id: result.data?.id ?? 'unknown', provider: 'resend' };
    } catch (err) {
      throw new Error('Email delivery failed. Please retry.');
    }
  }

  if (process.env.NODE_ENV === 'production') throw new Error('Email provider is not configured');
  console.log(`[EMAIL:MOCK] "${subject}" for ${to}: ${html.slice(0, 160)}`);
  return { id: `mock-${Date.now()}`, provider: 'mock' };
}

export function verificationCodeHtml(title: string, body: string, code: string, ttlMinutes: number): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #1a1a1a;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 600; margin: 0;">LUX Blinds</h1>
  </div>
  <h2 style="font-size: 18px; font-weight: 500; margin-bottom: 16px;">${title}</h2>
  <p style="font-size: 14px; line-height: 1.5; color: #555; margin-bottom: 24px;">${body}</p>
  <div style="text-align: center; margin: 32px 0;">
    <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a; font-family: 'Courier New', monospace;">${code}</span>
  </div>
  <p style="font-size: 12px; color: #999; text-align: center;">This code expires in ${ttlMinutes} minutes.</p>
</body>
</html>`;
}

function buildVerificationHtml(code: string, type: 'registration' | 'password-reset'): string {
  if (type === 'registration') {
    return verificationCodeHtml('Welcome to LUX Blinds', 'Use the code below to verify your account:', code, 10);
  }
  return verificationCodeHtml('Password Reset', 'Use the code below to reset your password:', code, 60);
}

export function isMockProvider(): boolean {
  return !resendApiKey;
}
