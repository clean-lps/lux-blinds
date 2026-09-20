import { NextResponse } from 'next/server';
import { requireActor } from '@/server/auth/session';
import { recordConsent, ProfileError } from '@/server/profile/service';
import type { ApiError } from '@/contracts/api';

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const actor = await requireActor(request);
    const body = await request.json();
    const { channel, granted, wordingVersion } = body;
    if (!channel || typeof granted !== 'boolean' || !wordingVersion) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'channel, granted, and wordingVersion required', retryable: false }, requestId },
        { status: 422 }
      );
    }
    await recordConsent(actor, channel, granted, wordingVersion);
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
