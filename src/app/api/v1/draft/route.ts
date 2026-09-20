import { NextResponse } from 'next/server';
import { z } from 'zod';
import { QuerySchema, SaveDraftSchema } from '@/contracts';
import { requireActor, UnauthorizedError } from '@/server/auth/session';
import { DraftConflictError, DraftValidationError, deleteDraft, getDraft, saveDraft } from '@/server/drafts/service';

function requestId(request: Request): string {
  return request.headers.get('x-request-id') ?? crypto.randomUUID();
}

function failure(error: unknown, id: string): NextResponse {
  if (error instanceof UnauthorizedError) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required', retryable: false }, requestId: id }, { status: 401 });
  if (error instanceof DraftConflictError) return NextResponse.json({ error: { code: 'CONFLICT', message: 'Draft revision conflict', retryable: true }, requestId: id }, { status: 409 });
  if (error instanceof DraftValidationError) return NextResponse.json({ error: { code: 'INVALID_INPUT', message: 'Invalid request', retryable: false }, requestId: id }, { status: 400 });
  return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Unable to process draft', retryable: true }, requestId: id }, { status: 500 });
}

export async function GET(request: Request): Promise<NextResponse> {
  const id = requestId(request);
  try {
    const draft = await getDraft(await requireActor(request));
    return NextResponse.json({ data: draft, requestId: id });
  } catch (error) {
    return failure(error, id);
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
  const id = requestId(request);
  const parsed = SaveDraftSchema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) return NextResponse.json({ error: { code: 'INVALID_INPUT', message: 'Invalid request', retryable: false }, requestId: id }, { status: 400 });
  try {
    const draft = await saveDraft(await requireActor(request), parsed.data);
    return NextResponse.json({ data: draft, requestId: id });
  } catch (error) {
    return failure(error, id);
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const id = requestId(request);
  const parsed = z.object({ expectedRevision: z.coerce.number().int().positive() }).safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: { code: 'INVALID_INPUT', message: 'Invalid request', retryable: false }, requestId: id }, { status: 400 });
  try {
    await deleteDraft(await requireActor(request), parsed.data.expectedRevision);
    return NextResponse.json({ data: { success: true }, requestId: id });
  } catch (error) {
    return failure(error, id);
  }
}
