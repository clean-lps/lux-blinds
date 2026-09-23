import { NextResponse } from 'next/server';
export function apiFailure(error: unknown, requestId: string) {
  const candidate = error as {status?:number;code?:string};
  const status = error instanceof SyntaxError ? 400 : candidate?.code === 'P2002' ? 409 : [400,401,403,404,409,422,503].includes(candidate?.status ?? 0) ? candidate.status! : 500;
  const codes: Record<number,string>={400:'INVALID_INPUT',401:'UNAUTHORIZED',403:'FORBIDDEN',404:'NOT_FOUND',409:'CONFLICT',422:'INVALID_INPUT',503:'UNAVAILABLE'};
  return NextResponse.json({error:{code:codes[status]??'INTERNAL_ERROR',message:status===409?'The record changed. Reload and try again.':status===401?'Authentication required':status===422?'Check the submitted values.':'Unable to complete request',retryable:status>=500},requestId},{status});
}
