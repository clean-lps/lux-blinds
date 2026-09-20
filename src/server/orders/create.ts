import { createHash, randomUUID } from 'node:crypto';
import type { Actor } from '@/contracts/auth';
import type { ClientOrderDTO, CreateOrderInput } from '@/contracts/orders';
import { CreateOrderSchema } from '@/contracts/orders';
import { normalizeOrderItem, validateOrderItem } from '@/server/domain/product-rules';
import { db } from '@/server/db';

export class IdempotencyConflictError extends Error { readonly status=409; constructor(){super('Idempotency key conflict');} }
export class OrderValidationError extends Error { readonly status=422; constructor(){super('Invalid order');} }

const hash=(input:CreateOrderInput)=>createHash('sha256').update(JSON.stringify(input)).digest('hex');

/** Deterministic fingerprint of an order request. The create endpoint compares
 *  this against the stored IdempotencyRecord to detect double submits. */
export function hashOrderInput(input: CreateOrderInput): string {
  const parsed = CreateOrderSchema.safeParse(input);
  if (!parsed.success) throw new OrderValidationError();
  return hash(parsed.data);
}
const dto=(order:{id:string;number:string;sidemark:string;status:'received'|'in_production'|'ready_for_installation'|'delivered'|'cancelled';revision:number;submittedAt:Date;specialNotes:string},items:(ReturnType<typeof normalizeOrderItem>&{id?:string})[]):ClientOrderDTO=>({id:order.id,number:order.number,sidemark:order.sidemark,status:order.status,revision:order.revision,submittedAt:order.submittedAt.toISOString(),items:items.map((item,i)=>({...item,id:item.id??`pending-${i}`})),specialNotes:order.specialNotes,attachments:[],publishedQuote:null});

export async function createOrder(actor:Actor,input:CreateOrderInput,key:string):Promise<ClientOrderDTO>{
  const parsed=CreateOrderSchema.safeParse(input); if(!parsed.success||!key.trim()) throw new OrderValidationError();
  const clean=parsed.data; const requestHash=hash(clean);
  const normalized=clean.items.map(item=>{const valid=validateOrderItem(item);if(!valid.success) throw new OrderValidationError();return normalizeOrderItem(valid.data);});
  return db.$transaction(async tx=>{
    const prior=await tx.idempotencyRecord.findUnique({where:{actorId_route_key:{actorId:actor.userId,route:'/api/v1/orders',key}}});
    if(prior){ if(prior.requestHash!==requestHash) throw new IdempotencyConflictError(); const order=await tx.order.findUniqueOrThrow({where:{id:prior.resultResourceId}}); const items=await tx.orderItem.findMany({where:{orderId:order.id},orderBy:{position:'asc'}}); return dto(order,items.map(item=>({...item,productType:item.productType as any,trackSupplied:item.trackSupplied,snapsSuggested:item.snapsSuggested,snapsSource:item.snapsSource as any,ruleVersion:item.ruleVersion}) as any)); }
    const order=await tx.order.create({data:{number:`ORD-${randomUUID()}`,organizationId:actor.organizationId,createdBy:actor.userId,sidemark:clean.sidemark,specialNotes:clean.specialNotes,items:{create:normalized.map((item,position)=>({...item,position,productType:item.productType,productOther:item.productOther??null,roomArea:item.roomArea??null,opening:item.opening??null,track:item.track??null,trackOther:item.trackOther??null,fullness:item.fullness??null,installation:item.installation??null,controlSide:item.controlSide??null,operation:item.operation??null,notes:item.notes??null,snapsManual:item.snapsManual??null,snapsSuggested:item.snapsSuggested??null,snapsSource:item.snapsSource??null}))}}});
    await tx.idempotencyRecord.create({data:{actorId:actor.userId,route:'/api/v1/orders',key,requestHash,resultResourceId:order.id,expiresAt:new Date(Date.now()+24*60*60*1000)}});
    const rows=await tx.orderItem.findMany({where:{orderId:order.id},orderBy:{position:'asc'},select:{id:true}}); return dto(order,normalized.map((item,index)=>({...item,id:rows[index]!.id})));
  });
}
