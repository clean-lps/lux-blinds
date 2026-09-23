import { NextResponse } from 'next/server';
import { requireActor } from '@/server/auth/session';
import { reviewTax } from '@/server/admin/customers';
import { apiFailure } from '@/server/api-error';
import { ReviewTaxSchema } from '@/contracts';
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = crypto.randomUUID();
  try { return NextResponse.json({ data: await reviewTax(await requireActor(request), (await context.params).id, ReviewTaxSchema.parse(await request.json())), requestId }, {status:200}); }
  catch (error) { if (error instanceof Error && error.name === 'ZodError') return apiFailure({status:422}, requestId); return apiFailure(error, requestId); }
}
