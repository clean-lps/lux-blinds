import { NextResponse } from 'next/server';
import { resendChallenge, ChallengeNotFoundError } from '@/server/auth/registration';
import type { ApiError } from '@/contracts/api';

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await request.json();
    const identifier = body.identifier ?? body.challengeId;
    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'identifier required', retryable: false }, requestId },
        { status: 422 }
      );
    }
    const challenge = await resendChallenge(identifier);
    return NextResponse.json({ data: challenge, requestId });
  } catch (error) {
    if (error instanceof ChallengeNotFoundError) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: error.message, retryable: false }, requestId },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error', retryable: true }, requestId },
      { status: 500 }
    );
  }
}
