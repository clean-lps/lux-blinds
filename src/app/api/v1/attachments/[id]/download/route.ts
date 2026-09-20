import { NextResponse } from 'next/server';
import { requireActor, UnauthorizedError } from '@/server/auth/session';
import { AttachmentForbiddenError, AttachmentNotFoundError, UploadRejectedError, authorizeDownload } from '@/server/storage/service';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  try {
    const { id } = await context.params;
    const download = await authorizeDownload(await requireActor(request), id);
    return NextResponse.json({ data: download, requestId });
  } catch (error) {
    const status = error instanceof UnauthorizedError ? 401 : error instanceof AttachmentNotFoundError ? 404 : error instanceof AttachmentForbiddenError ? 403 : error instanceof UploadRejectedError ? 422 : 500;
    const code = status === 401 ? 'UNAUTHORIZED' : status === 404 ? 'NOT_FOUND' : status === 403 ? 'FORBIDDEN' : status === 422 ? 'UPLOAD_UNAVAILABLE' : 'INTERNAL_ERROR';
    const message = status === 401 ? 'Authentication required' : status === 404 ? 'Not found' : status === 403 ? 'Forbidden' : status === 422 ? 'Attachment is not available' : 'Unable to authorize download';
    return NextResponse.json({ error: { code, message, retryable: status === 500 }, requestId }, { status });
  }
}
