import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireActor, UnauthorizedError } from '@/server/auth/session';
import { AttachmentForbiddenError, AttachmentNotFoundError, UploadRejectedError, completeUpload } from '@/server/storage/service';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  const parsed = z.strictObject({ checksum: z.string().regex(/^[a-f0-9]{64}$/) }).safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) return NextResponse.json({ error: { code: 'INVALID_INPUT', message: 'Invalid request', retryable: false }, requestId }, { status: 400 });
  try {
    const { id } = await context.params;
    const attachment = await completeUpload(await requireActor(request), id, parsed.data.checksum);
    return NextResponse.json({ data: attachment, requestId }, { status: 202 });
  } catch (error) {
    const status = error instanceof UnauthorizedError ? 401 : error instanceof AttachmentNotFoundError ? 404 : error instanceof AttachmentForbiddenError ? 403 : error instanceof UploadRejectedError ? 422 : 500;
    const code = status === 401 ? 'UNAUTHORIZED' : status === 404 ? 'NOT_FOUND' : status === 403 ? 'FORBIDDEN' : status === 422 ? 'UPLOAD_REJECTED' : 'INTERNAL_ERROR';
    const message = status === 401 ? 'Authentication required' : status === 404 ? 'Not found' : status === 403 ? 'Forbidden' : status === 422 ? 'Upload rejected' : 'Unable to complete upload';
    return NextResponse.json({ error: { code, message, retryable: status === 500 }, requestId }, { status });
  }
}
