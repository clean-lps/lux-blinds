import { NextResponse } from 'next/server';
import { registerPendingUser, RegistrationError } from '@/server/auth/registration';
import type { ApiError } from '@/contracts/api';

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const raw = await request.text();
    console.log('[REGISTER] Raw body:', raw);
    const body = raw ? JSON.parse(raw) : {};
    const challenge = await registerPendingUser(body);
    return NextResponse.json({ data: challenge, requestId }, { status: 201 });
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
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
