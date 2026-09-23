import { NextResponse } from 'next/server';
import { requireActor } from '@/server/auth/session';
import { createQuote } from '@/server/admin/orders';
import { apiFailure } from '@/server/api-error';
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = crypto.randomUUID();
  try { return NextResponse.json({ data: await createQuote(await requireActor(request), (await context.params).id, await request.json()), requestId }, {status:201}); }
  catch (error) { return apiFailure(error, requestId); }
}
