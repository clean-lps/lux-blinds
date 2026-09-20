import type {Actor} from '@/contracts/auth'; import {db} from '@/server/db'; import {authorize} from '@/server/auth/authorize';
import {enqueueOutbox} from '@/server/outbox/worker';
export class AdminOrderError extends Error{constructor(readonly status:number){super('Admin order error');}}
function staff(a:Actor){if(a.role==='client')throw new AdminOrderError(403);}
async function order(a:Actor,id:string){staff(a);const o=await db.order.findFirst({where:{id,...(a.role==='admin'?{}:{organizationId:a.organizationId})},include:{items:true,organization:true,notes:true,quotes:true}});if(!o)throw new AdminOrderError(404);return o;}
export async function getAdminOrder(a:Actor,id:string){return order(a,id);}
export const adminOrder = getAdminOrder;
export async function changeStatus(a:Actor,id:string,input:any){const o=await order(a,id);if(input.status==='cancelled'&&!input.reason)throw new AdminOrderError(422);const u=await db.order.updateMany({where:{id:o.id,revision:input.expectedVersion},data:{status:input.status,revision:{increment:1}}});if(!u.count)throw new AdminOrderError(409);const updated=await order(a,id);void notifyStatusChange(updated).catch((err)=>console.error('[NOTIFY] status change failed:',err?.message??err));return updated;}
export async function correctOrder(a:Actor,id:string,input:any){const o=await order(a,id);const u=await db.order.updateMany({where:{id:o.id,revision:input.expectedVersion},data:{sidemark:input.sidemark??o.sidemark,revision:{increment:1}}});if(!u.count)throw new AdminOrderError(409);return order(a,id);}
export async function addNote(a:Actor,id:string,text:string){const o=await order(a,id);return db.internalNote.create({data:{orderId:o.id,authorId:a.userId,text}});}
export async function listAudit(a:Actor,id:string){const o=await order(a,id);return db.auditEvent.findMany({where:{resourceType:'order',resourceId:o.id},orderBy:{createdAt:'desc'}});}
export async function createQuote(a:Actor,id:string,input:any){const o=await order(a,id);const q=await db.quote.create({data:{orderId:o.id,revision:o.quotes.length+1,currency:input.currency,amountMinor:BigInt(input.amountMinor),notes:input.notes??''}});return {...q,amountMinor:q.amountMinor.toString()};}
export async function publishQuote(a:Actor,id:string,expectedVersion:number){staff(a);const q=await db.quote.findUnique({where:{id},include:{order:true}});if(!q||q.order.revision!==expectedVersion)throw new AdminOrderError(q?409:404);return db.quote.update({where:{id},data:{status:'published',publishedAt:new Date()}});}

async function notifyStatusChange(o:any){
  const members=await db.membership.findMany({where:{organizationId:o.organizationId},include:{user:{select:{id:true,email:true}}}});
  const title=`Order ${o.number} is now ${o.status}`;
  const safeBody=`Your order ${o.number} (${o.sidemark}) changed status to ${o.status}.`;
  for(const m of members){
    await db.notification.create({data:{recipientId:m.user.id,orderId:o.id,type:'order_status',title,safeBody}});
    await enqueueOutbox('email',{to:m.user.email,subject:title,html:`<p>${safeBody}</p>`});
  }
}
