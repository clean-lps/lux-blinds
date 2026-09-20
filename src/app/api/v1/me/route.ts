import { NextResponse } from 'next/server';
import { requireActor } from '@/server/auth/session';
import { getProfile } from '@/server/profile/service';
import type { ApiError } from '@/contracts/api';

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const actor = await requireActor(request);
    const profile = await getProfile(actor);
    return NextResponse.json({ data: profile, requestId });
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message, retryable: false }, requestId },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error', retryable: true }, requestId },
      { status: 500 }
    );
  }
}
