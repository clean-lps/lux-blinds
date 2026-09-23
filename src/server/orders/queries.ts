import type { Actor } from '@/contracts/auth';
import type { CursorPage } from '@/contracts/api';
import type { ClientOrderDTO, DashboardDTO, OrderQuery } from '@/contracts/orders';
import { db } from '@/server/db';
import { orderItemDTO } from './item-dto';

export class OrderNotFoundError extends Error { readonly status=404; }

const include = { items: { orderBy: { position: 'asc' as const } }, attachments: true, quotes: { where: { status: 'published' }, orderBy: { revision: 'desc' as const }, take: 1 } };
function map(order:any):ClientOrderDTO {
  const quote = order.quotes?.[0];
  return {id:order.id,number:order.number,sidemark:order.sidemark,status:order.status,revision:order.revision,submittedAt:order.submittedAt.toISOString(),items:order.items.map(orderItemDTO),specialNotes:order.specialNotes,
    attachments:(order.attachments ?? []).map(({id,name,mediaType,byteSize,scanStatus,uploadStatus}:any)=>({id,name,mediaType,byteSize,scanStatus,uploadStatus})),
    publishedQuote:quote ? {id:quote.id,revision:quote.revision,currency:quote.currency,amountMinor:quote.amountMinor.toString(),status:quote.status,notes:quote.notes,publishedAt:quote.publishedAt?.toISOString()??null}:null}; }
function cursor(value?:string){if(!value)return undefined;const i=value.lastIndexOf(':');const date=new Date(value.slice(0,i));if(i<0||Number.isNaN(+date))throw new OrderNotFoundError();return{date,id:value.slice(i+1)};}
export async function listOrders(actor:Actor,query:OrderQuery):Promise<CursorPage<ClientOrderDTO>>{const c=cursor(query.cursor);const rows=await db.order.findMany({where:{organizationId:actor.organizationId,...(query.status?{status:query.status}:{}),...(query.q?{OR:[{number:{contains:query.q,mode:'insensitive'}},{sidemark:{contains:query.q,mode:'insensitive'}}]}:{}),...(c?{AND:[{OR:[{submittedAt:{lt:c.date}},{submittedAt:c.date,id:{lt:c.id}}]}]}:{})},include,orderBy:[{submittedAt:'desc'},{id:'desc'}],take:query.limit+1});const next=rows.length>query.limit?rows[query.limit-1]:undefined;return{data:rows.slice(0,query.limit).map(map),page:{nextCursor:next?`${next.submittedAt.toISOString()}:${next.id}`:null},requestId:''};}
export async function getOrder(actor:Actor,id:string){const row=await db.order.findFirst({where:{id,organizationId:actor.organizationId},include});if(!row)throw new OrderNotFoundError();return map(row);}
export async function getDashboard(actor:Actor):Promise<DashboardDTO>{
  const where={organizationId:actor.organizationId};
  const [orders,draft,total,received,inProduction,completed]=await Promise.all([
    db.order.findMany({where,include,orderBy:{submittedAt:'desc'},take:5}),db.draft.findFirst({where:{userId:actor.userId,...where}}),
    db.order.count({where}),db.order.count({where:{...where,status:'received'}}),db.order.count({where:{...where,status:'in_production'}}),db.order.count({where:{...where,status:'delivered'}})]);
  return{counts:{total,received,inProduction,completed},completedDefinition:'delivered-provisional',recentOrders:orders.map(map),draft:draft?{id:draft.id,revision:draft.revision,modelCount:Array.isArray((draft.payload as any).items)?(draft.payload as any).items.length:0}:null};
}
