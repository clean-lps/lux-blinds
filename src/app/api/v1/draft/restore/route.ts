import { NextResponse } from 'next/server';
import { RestoreDraftSchema } from '@/contracts';
import { requireActor, UnauthorizedError } from '@/server/auth/session';
import { DraftConflictError, DraftNotFoundError, DraftValidationError, restoreDraft } from '@/server/drafts/service';

export async function POST(request: Request): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  const parsed = RestoreDraftSchema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) return NextResponse.json({ error: { code: 'INVALID_INPUT', message: 'Invalid request', retryable: false }, requestId }, { status: 400 });
  try {
    const draft = await restoreDraft(await requireActor(request), parsed.data);
    return NextResponse.json({ data: draft, requestId });
  } catch (error) {
    const status = error instanceof UnauthorizedError ? 401 : error instanceof DraftNotFoundError ? 404 : error instanceof DraftConflictError ? 409 : error instanceof DraftValidationError ? 400 : 500;
    const code = status === 401 ? 'UNAUTHORIZED' : status === 404 ? 'NOT_FOUND' : status === 409 ? 'CONFLICT' : status === 400 ? 'INVALID_INPUT' : 'INTERNAL_ERROR';
    const message = status === 401 ? 'Authentication required' : status === 404 ? 'Not found' : status === 409 ? 'Draft revision conflict' : status === 400 ? 'Invalid request' : 'Unable to restore draft';
    return NextResponse.json({ error: { code, message, retryable: status === 409 || status === 500 }, requestId }, { status });
  }
}
