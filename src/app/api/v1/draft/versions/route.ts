import { NextResponse } from 'next/server';
import { QuerySchema } from '@/contracts';
import { requireActor, UnauthorizedError } from '@/server/auth/session';
import { DraftValidationError, listDraftVersions } from '@/server/drafts/service';

export async function GET(request: Request): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  const query = QuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!query.success) return NextResponse.json({ error: { code: 'INVALID_INPUT', message: 'Invalid request', retryable: false }, requestId }, { status: 400 });
  try {
    const result = await listDraftVersions(await requireActor(request), query.data);
    return NextResponse.json({ ...result, requestId });
  } catch (error) {
    const status = error instanceof UnauthorizedError ? 401 : error instanceof DraftValidationError ? 400 : 500;
    const code = status === 401 ? 'UNAUTHORIZED' : status === 400 ? 'INVALID_INPUT' : 'INTERNAL_ERROR';
    const message = status === 401 ? 'Authentication required' : status === 400 ? 'Invalid request' : 'Unable to list draft versions';
    return NextResponse.json({ error: { code, message, retryable: status === 500 }, requestId }, { status });
  }
}
