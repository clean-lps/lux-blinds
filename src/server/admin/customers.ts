import type {Actor} from '@/contracts/auth'; import type {AdminCustomerDTO,ReviewTaxInput} from '@/contracts/admin'; import {db} from '@/server/db';
export class AdminForbiddenError extends Error{readonly status=403;} export class AdminNotFoundError extends Error{readonly status=404;} export class AdminConflictError extends Error{readonly status=409;}
function staff(a:Actor){if(a.role!=='admin'&&a.role!=='operator')throw new AdminForbiddenError();}
async function dto(org:any):Promise<AdminCustomerDTO>{const m=await db.membership.findFirst({where:{organizationId:org.id},include:{user:true}});if(!m)throw new AdminNotFoundError();const certificate=await db.attachment.findFirst({where:{organizationId:org.id,purpose:'tax_certificate',uploadStatus:'uploaded',scanStatus:'clean'},orderBy:{createdAt:'desc'}});return{id:org.id,organizationId:org.id,revision:org.revision,companyName:org.companyName,contactName:org.contactName,phone:org.phone,address:org.address,email:m.user.email,emailVerified:m.user.emailVerified,smsConsent:false,taxStatus:org.taxStatus as any,certificateId:certificate?.id??null,orderCount:await db.order.count({where:{organizationId:org.id}})};}
export async function listCustomers(a:Actor){staff(a);return Promise.all((await db.organization.findMany({where:{...(a.role==='admin'?{}:{id:a.organizationId}),memberships:{some:{user:{role:'client'}}}},orderBy:{createdAt:'desc'}})).map(dto));}
export async function getCustomer(a:Actor,id:string){staff(a);if(a.role!=='admin'&&id!==a.organizationId)throw new AdminNotFoundError();const o=await db.organization.findUnique({where:{id}});if(!o)throw new AdminNotFoundError();return dto(o);}
export async function reviewTax(a:Actor,id:string,input:ReviewTaxInput){
  if(a.role!=='admin')throw new AdminForbiddenError();
  const certificate=await db.attachment.findFirst({where:{id:input.certificateId,organizationId:id,purpose:'tax_certificate',uploadStatus:'uploaded',scanStatus:'clean'}});
  if(!certificate)throw new AdminNotFoundError();
  await db.$transaction(async tx=>{
    const o=await tx.organization.updateMany({where:{id,revision:input.expectedVersion},data:{taxStatus:input.status,revision:{increment:1}}});if(!o.count)throw new AdminConflictError();
    await tx.auditEvent.create({data:{actorId:a.userId,organizationId:id,resourceType:'organization',resourceId:id,action:'tax_reviewed',requestId:crypto.randomUUID(),redactedDiff:{status:{after:input.status},certificateId:{after:input.certificateId},reason:{after:input.reason}}}});
  });
  return getCustomer(a,id);
}
