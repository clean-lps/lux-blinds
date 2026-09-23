import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { emailProvider } from './provider';

export class EmailDeliveryError extends Error {}

async function sendGmail(to: string, subject: string, html: string): Promise<SendEmailResult> {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '');
  if (!user || !pass) throw new EmailDeliveryError('Email provider is not configured');
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user, pass },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    tls: { minVersion: 'TLSv1.2' },
  });
  try {
    const result = await transport.sendMail({ from: { name: 'LUX Blinds', address: user }, to, subject, html });
    if (!result.accepted?.length || result.rejected?.length) throw new Error('Recipient rejected');
    return { id: result.messageId, provider: 'gmail' };
  } catch {
    throw new EmailDeliveryError('Email delivery failed. Please retry.');
  }
}

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
  provider: 'resend' | 'gmail' | 'mock';
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

  return sendTransactionalEmail(to, subject, html);
}

export async function sendTransactionalEmail(to: string, subject: string, html: string): Promise<SendEmailResult> {
  const provider = emailProvider();
  if (provider === 'gmail') return sendGmail(to, subject, html);
  if (provider !== 'resend' && provider !== 'mock') throw new EmailDeliveryError('Email provider is not configured');

  if (provider === 'resend' && resendApiKey) {
    try {
      const client = getClient();
      const result = await client.emails.send({
        from: fromAddress,
        to: [to],
        subject,
        html,
      });
      if (result.error || !result.data?.id) throw new Error('Email provider rejected delivery');
      return { id: result.data?.id ?? 'unknown', provider: 'resend' };
    } catch (err) {
      throw new EmailDeliveryError('Email delivery failed. Please retry.');
    }
  }

  if (process.env.NODE_ENV === 'production' || provider !== 'mock') throw new EmailDeliveryError('Email provider is not configured');
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
  return emailProvider() === 'mock' && process.env.NODE_ENV !== 'production';
}
