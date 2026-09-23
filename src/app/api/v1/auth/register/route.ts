import { NextResponse } from 'next/server';
import { registerPendingUser, RegistrationError, ChallengeRateLimitError } from '@/server/auth/registration';
import type { ApiError } from '@/contracts/api';
import { EmailDeliveryError } from '@/server/email/service';

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await request.json().catch(() => ({}));
    const challenge = await registerPendingUser(body);
    return NextResponse.json({ data: challenge, requestId }, { status: 201 });
  } catch (error) {
    if (error instanceof EmailDeliveryError) {
      return NextResponse.json(
        { error: { code: 'EMAIL_DELIVERY_FAILED', message: 'We could not send your verification email. Please try again in a minute or contact support.', retryable: true }, requestId },
        { status: 503 },
      );
    }
    if (error instanceof ChallengeRateLimitError) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: error.message, retryable: true }, requestId },
        { status: error.status },
      );
    }
    if (error instanceof RegistrationError) {
      const response: ApiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          fieldErrors: error.fieldErrors,
          retryable: false,
        },
        requestId,
      };
      return NextResponse.json(response, { status: error.status });
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error', retryable: true }, requestId },
      { status: 500 }
    );
  }
}
