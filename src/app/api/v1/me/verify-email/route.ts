import { NextResponse } from 'next/server';
import { requireActor } from '@/server/auth/session';
import { verifyChangedEmail, ProfileError } from '@/server/profile/service';
import type { ApiError } from '@/contracts/api';

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const actor = await requireActor(request);
    const body = await request.json();
    const { newEmail, code } = body ?? {};
    if (!newEmail || typeof newEmail !== 'string' || !code || typeof code !== 'string') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'newEmail and code required', retryable: false }, requestId },
        { status: 422 }
      );
    }
    await verifyChangedEmail(actor, newEmail, code);
    return NextResponse.json({ data: { success: true }, requestId });
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
