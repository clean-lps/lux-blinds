const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const smsEnabled = process.env.SMS_ENABLED === 'true';

export interface SendSmsResult {
  id: string;
  provider: 'twilio' | 'mock';
}

export function isSmsMockProvider(): boolean {
  return !smsEnabled || !accountSid || !authToken || !fromNumber;
}

export async function sendVerificationSms(to: string, code: string): Promise<SendSmsResult> {
  const body = `LUX Blinds verification code: ${code}. It expires in 10 minutes.`;

  if (!smsEnabled) {
    throw new Error('SMS verification is disabled (SMS_ENABLED=false). Choose email verification.');
  }

  if (accountSid && authToken && fromNumber) {
    try {
      const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const params = new URLSearchParams({ To: to, From: fromNumber, Body: body });
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Twilio rejected the SMS (${response.status}): ${text.slice(0, 200)}`);
      }
      const payload = (await response.json().catch(() => null)) as { sid?: string } | null;
      console.log(`[SMS] Sent verification code to ${to} via Twilio (sid: ${payload?.sid ?? 'unknown'})`);
      return { id: payload?.sid ?? 'unknown', provider: 'twilio' };
    } catch (err) {
      console.error('[SMS] Twilio failed:', err);
      throw new Error('Could not send the SMS code. Please try email verification.');
    }
  }

  console.log(`[SMS:MOCK] verification code for ${to}: ${code}`);
  return { id: `mock-${Date.now()}`, provider: 'mock' };
}
