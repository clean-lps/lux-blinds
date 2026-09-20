import { NextResponse } from 'next/server';
import { verifyChallenge, ChallengeNotFoundError, ChallengeExpiredError, CodeInvalidError, CodeUsedError, RegistrationError } from '@/server/auth/registration';
import type { ApiError } from '@/contracts/api';

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await request.json();
    const user = await verifyChallenge(body);
    return NextResponse.json({ data: user, requestId });
  } catch (error) {
    if (error instanceof ChallengeNotFoundError) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: error.message, retryable: false }, requestId },
        { status: 404 }
      );
    }
    if (error instanceof ChallengeExpiredError) {
      return NextResponse.json(
        { error: { code: 'EXPIRED', message: error.message, retryable: false }, requestId },
        { status: 410 }
      );
    }
    if (error instanceof CodeInvalidError || error instanceof CodeUsedError) {
      return NextResponse.json(
        { error: { code: 'INVALID_CODE', message: error.message, retryable: false }, requestId },
        { status: 422 }
      );
    }
    if (error instanceof RegistrationError) {
      return NextResponse.json(
        { error: { code: 'REGISTRATION_ERROR', message: error.message, retryable: false, fieldErrors: error.fieldErrors }, requestId },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error', retryable: true }, requestId },
      { status: 500 }
    );
  }
}
