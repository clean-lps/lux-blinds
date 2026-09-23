import { NextResponse } from 'next/server';
import { requireActor } from '@/server/auth/session';
import { getProfile, updateProfile } from '@/server/profile/service';
import type { ApiError } from '@/contracts/api';

export async function PUT(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const actor = await requireActor(request);
    return NextResponse.json({ data: await updateProfile(actor, await request.json()), requestId });
  } catch (error: any) {
    const status = error instanceof SyntaxError ? 400 : error.status ?? 500;
    return NextResponse.json({ error: { code: status === 409 ? 'CONFLICT' : status === 401 ? 'UNAUTHORIZED' : 'PROFILE_ERROR', message: status === 500 ? 'Could not save profile' : error.message, fieldErrors: error.fieldErrors, retryable: status >= 500 }, requestId }, { status });
  }
}

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
