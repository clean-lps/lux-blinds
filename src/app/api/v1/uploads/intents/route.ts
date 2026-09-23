import { NextResponse } from 'next/server';
import { UploadIntentSchema } from '@/contracts';
import { requireActor, UnauthorizedError } from '@/server/auth/session';
import { AttachmentForbiddenError, AttachmentNotFoundError, StorageUnavailableError, UploadRejectedError, createUploadIntent } from '@/server/storage/service';

export async function POST(request: Request): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  const parsed = UploadIntentSchema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) return NextResponse.json({ error: { code: 'INVALID_INPUT', message: 'Invalid request', retryable: false }, requestId }, { status: 400 });
  try {
    const intent = await createUploadIntent(await requireActor(request), parsed.data);
    return NextResponse.json({ data: intent, requestId }, { status: 201 });
  } catch (error) {
    const status = error instanceof UnauthorizedError ? 401 : error instanceof AttachmentNotFoundError ? 404 : error instanceof AttachmentForbiddenError ? 403 : error instanceof UploadRejectedError ? 422 : error instanceof StorageUnavailableError ? 503 : 500;
    const code = status === 401 ? 'UNAUTHORIZED' : status === 404 ? 'NOT_FOUND' : status === 403 ? 'FORBIDDEN' : status === 422 ? 'UPLOAD_REJECTED' : status === 503 ? 'STORAGE_UNAVAILABLE' : 'INTERNAL_ERROR';
    const message = status === 401 ? 'Authentication required' : status === 404 ? 'Not found' : status === 403 ? 'Forbidden' : status === 422 ? 'Upload rejected' : status === 503 ? 'Private object storage is not configured' : 'Unable to create upload intent';
    return NextResponse.json({ error: { code, message, retryable: status === 500 }, requestId }, { status });
  }
}
