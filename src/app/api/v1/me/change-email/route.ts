import { NextResponse } from 'next/server';
import { requireActor } from '@/server/auth/session';
import { changeEmail, ProfileError } from '@/server/profile/service';
import type { ApiError } from '@/contracts/api';

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const actor = await requireActor(request);
    const body = await request.json();
    const { newEmail } = body;
    if (!newEmail || typeof newEmail !== 'string') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'newEmail required', retryable: false }, requestId },
        { status: 422 }
      );
    }
    const result = await changeEmail(actor, newEmail);
    return NextResponse.json({ data: { success: true, devCode: result.devCode ?? null }, requestId });
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message, retryable: false }, requestId },
        { status: 401 }
      );
    }
    if (error instanceof ProfileError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: error.message, retryable: false }, requestId },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error', retryable: true }, requestId },
      { status: 500 }
    );
  }
}
