import { NextResponse } from 'next/server';
import { getPendingEmail } from '@/server/auth/registration';
import type { ApiError } from '@/contracts/api';

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const url = new URL(request.url);
    const identifier = url.searchParams.get('identifier');
    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'identifier required', retryable: false }, requestId },
        { status: 422 }
      );
    }
    const result = await getPendingEmail(identifier);
    if (!result) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'No pending registration', retryable: false }, requestId },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: result, requestId });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error', retryable: true }, requestId },
      { status: 500 }
    );
  }
}
