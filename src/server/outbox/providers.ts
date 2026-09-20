import { sendTransactionalEmail } from '@/server/email/service';
import { sendVerificationSms } from '@/server/sms/service';

export type OutboxChannel = 'email' | 'sms' | 'log';

export interface OutboxEmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface OutboxSmsPayload {
  to: string;
  code: string;
}

export async function dispatchOutboxEvent(channel: string, payload: unknown): Promise<void> {
  if (channel === 'email') {
    const p = payload as OutboxEmailPayload;
    if (!p?.to || !p?.subject || !p?.html) throw new Error('Invalid email outbox payload');
    await sendTransactionalEmail(p.to, p.subject, p.html);
    return;
  }
  if (channel === 'sms') {
    const p = payload as OutboxSmsPayload;
    if (!p?.to || !p?.code) throw new Error('Invalid sms outbox payload');
    await sendVerificationSms(p.to, p.code);
    return;
  }
  if (channel === 'log') {
    console.log('[OUTBOX:LOG]', JSON.stringify(payload).slice(0, 500));
    return;
  }
  throw new Error(`Unknown outbox channel: ${channel}`);
}

export const mockProvider = Object.freeze({
  async send() {
    return { accepted: true };
  },
});
