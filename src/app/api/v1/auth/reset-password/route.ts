import { NextResponse } from 'next/server';
import { resetPassword, RecoveryError, TokenNotFoundError } from '@/server/auth/recovery';
import type { ApiError } from '@/contracts/api';

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await request.json();
    await resetPassword(body);
    return NextResponse.json({ data: { success: true }, requestId });
  } catch (error) {
    if (error instanceof RecoveryError) {
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
    if (error instanceof TokenNotFoundError) {
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
