import { NextResponse } from 'next/server';
import { requireActor } from '@/server/auth/session'; import { getOrder } from '@/server/orders/queries';
export async function GET(r:Request,c:{params:Promise<{id:string}>}){const requestId=r.headers.get('x-request-id')??crypto.randomUUID();try{return NextResponse.json({data:await getOrder(await requireActor(r),(await c.params).id),requestId});}catch{return NextResponse.json({error:{code:'NOT_FOUND',message:'Not found',retryable:false},requestId},{status:404});}}
