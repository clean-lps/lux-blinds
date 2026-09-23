import type { Actor } from '@/contracts/auth';
import type { AdminOrderDTO, AuditDTO, InternalNoteDTO } from '@/contracts/admin';
import type { CursorPage, OrderQuery, QuoteDTO } from '@/contracts';
import { db } from '@/server/db';
import { orderItemDTO } from '@/server/orders/item-dto';
import { ChangeStatusSchema, CorrectOrderSchema, CreateQuoteSchema } from '@/contracts/admin';
import { normalizeOrderItem, validateOrderItem } from '@/server/domain/product-rules';
import { orderTransitions } from '@/contracts/order-transitions';

export class AdminOrderError extends Error {
  constructor(readonly status: number) {
    super('Admin order error');
  }
}

function staff(actor: Actor) {
  if (actor.role === 'client') throw new AdminOrderError(403);
}

function cursor(value?: string) {
  if (!value) return undefined;
  const separator = value.lastIndexOf(':');
  const date = new Date(value.slice(0, separator));
  if (separator < 0 || Number.isNaN(+date)) throw new AdminOrderError(400);
  return { date, id: value.slice(separator + 1) };
}

function quoteDTO(quote: any): QuoteDTO {
  return {
    id: quote.id,
    revision: quote.revision,
    currency: quote.currency,
    amountMinor: quote.amountMinor.toString(),
    status: quote.status,
    notes: quote.notes,
    publishedAt: quote.publishedAt ? quote.publishedAt.toISOString() : null,
  };
}

function mapOrder(row: any, audits: AuditDTO[] = []): AdminOrderDTO {
  const quotes = row.quotes.map(quoteDTO);
  return {
    id: row.id,
    number: row.number,
    sidemark: row.sidemark,
    status: row.status,
    revision: row.revision,
    submittedAt: row.submittedAt.toISOString(),
    items: row.items.map(orderItemDTO),
    specialNotes: row.specialNotes,
    attachments: row.attachments.map((attachment: any) => ({
      id: attachment.id,
      name: attachment.name,
      mediaType: attachment.mediaType,
      byteSize: attachment.byteSize,
      scanStatus: attachment.scanStatus,
      uploadStatus: attachment.uploadStatus,
    })),
    publishedQuote: quotes.find((quote: QuoteDTO) => quote.status === 'published') ?? null,
    organizationId: row.organizationId,
    customerName: row.organization.companyName,
    internalNotes: row.notes.map((note: any): InternalNoteDTO => ({
      id: note.id,
      authorName: note.authorId,
      text: note.text,
      createdAt: note.createdAt.toISOString(),
    })),
    audit: audits,
    quotes,
  };
}

const orderInclude = {
  items: true,
  organization: true,
  attachments: true,
  notes: true,
  quotes: { orderBy: { revision: 'desc' } },
} as const;

async function auditForOrder(orderId: string): Promise<AuditDTO[]> {
  const events = await db.auditEvent.findMany({
    where: { resourceType: 'order', resourceId: orderId },
    orderBy: { createdAt: 'desc' },
  });
  return events.map((event) => ({
    id: event.id,
    actorName: event.actorId,
    action: event.action,
    reason: (event.redactedDiff as any).reason?.after ?? null,
    createdAt: event.createdAt.toISOString(),
    revision: (event.redactedDiff as any).revision?.after ?? 0,
    changes: event.redactedDiff as Record<string, { before: unknown; after: unknown }>,
  }));
}

async function order(actor: Actor, id: string): Promise<AdminOrderDTO> {
  staff(actor);
  const row = await db.order.findFirst({
    where: { id, ...(actor.role === 'admin' ? {} : { organizationId: actor.organizationId }) },
    include: orderInclude,
  });
  if (!row) throw new AdminOrderError(404);
  return mapOrder(row, await auditForOrder(row.id));
}

export async function listAdminOrders(actor: Actor, query: OrderQuery): Promise<CursorPage<AdminOrderDTO>> {
  staff(actor);
  const after = cursor(query.cursor);
  const rows = await db.order.findMany({
    where: {
      ...(actor.role === 'admin' ? {} : { organizationId: actor.organizationId }),
      ...(query.status ? { status: query.status } : {}),
      ...(query.q ? {
        OR: [
          { number: { contains: query.q, mode: 'insensitive' } },
          { sidemark: { contains: query.q, mode: 'insensitive' } },
          { organization: { is: { companyName: { contains: query.q, mode: 'insensitive' } } } },
        ],
      } : {}),
      ...(after ? { AND: [{ OR: [{ submittedAt: { lt: after.date } }, { submittedAt: after.date, id: { lt: after.id } }] }] } : {}),
    },
    include: orderInclude,
    orderBy: [{ submittedAt: 'desc' }, { id: 'desc' }],
    take: query.limit + 1,
  });
  const next = rows.length > query.limit ? rows[query.limit - 1] : undefined;
  return {
    data: rows.slice(0, query.limit).map((row) => mapOrder(row)),
    page: { nextCursor: next ? `${next.submittedAt.toISOString()}:${next.id}` : null },
    requestId: '',
  };
}

export async function getAdminOrder(actor: Actor, id: string) {
  return order(actor, id);
}

export async function changeStatus(actor: Actor, id: string, input: any) {
  const parsed = ChangeStatusSchema.safeParse(input);
  if (!parsed.success) throw new AdminOrderError(422);
  input = parsed.data;
  const current = await order(actor, id);
  if (!orderTransitions[current.status].includes(input.status)) throw new AdminOrderError(422);
  await db.$transaction(async tx => {
  const updated = await tx.order.updateMany({
    where: { id: current.id, revision: input.expectedVersion },
    data: { status: input.status, revision: { increment: 1 } },
  });
  if (!updated.count) throw new AdminOrderError(409);
  await tx.auditEvent.create({data:{actorId:actor.userId,organizationId:current.organizationId,resourceType:'order',resourceId:id,action:'status_changed',requestId:crypto.randomUUID(),redactedDiff:{status:{before:current.status,after:input.status},reason:{before:null,after:input.reason??null},revision:{before:current.revision,after:current.revision+1}}}});
  const members = await tx.membership.findMany({where:{organizationId:current.organizationId},include:{user:{select:{id:true,email:true}}}});
  const title = `Order ${current.number} is now ${input.status}`;
  for (const member of members) {
    await tx.notification.create({data:{recipientId:member.user.id,orderId:id,type:'order_status',title,safeBody:title}});
    await tx.outbox.create({data:{eventId:crypto.randomUUID(),channel:'email',payload:{to:member.user.email,subject:title,html:`<p>${title}</p>`}}});
  }
  }, {timeout:20000});
  const result = await order(actor, id);
  return result;
}

export async function correctOrder(actor: Actor, id: string, input: any) {
  const parsed = CorrectOrderSchema.safeParse(input);
  if (!parsed.success) throw new AdminOrderError(422);
  input = parsed.data;
  const current = await order(actor, id);
  if (['delivered','cancelled'].includes(current.status)) throw new AdminOrderError(422);
  const items = parsed.data.items?.map(item => { const result=validateOrderItem(item); if(!result.success) throw new AdminOrderError(422); return normalizeOrderItem(result.data); });
  await db.$transaction(async tx => {
  const updated = await tx.order.updateMany({
    where: { id: current.id, revision: input.expectedVersion },
    data: { sidemark: input.sidemark ?? current.sidemark, revision: { increment: 1 } },
  });
  if (!updated.count) throw new AdminOrderError(409);
  if(items) {
    await tx.orderItem.deleteMany({where:{orderId:id}});
    await tx.orderItem.createMany({data:items.map((item,position)=>({...item,orderId:id,position}))});
  }
  await tx.orderRevision.create({data:{orderId:id,revision:current.revision+1,actorId:actor.userId,reason:input.reason,snapshot:JSON.parse(JSON.stringify({sidemark:input.sidemark??current.sidemark,items:items??current.items}))}});
  await tx.auditEvent.create({data:{actorId:actor.userId,organizationId:current.organizationId,resourceType:'order',resourceId:id,action:'order_corrected',requestId:crypto.randomUUID(),redactedDiff:JSON.parse(JSON.stringify({sidemark:{before:current.sidemark,after:input.sidemark??current.sidemark},items:{before:current.items,after:items??current.items},reason:{before:null,after:input.reason},revision:{before:current.revision,after:current.revision+1}}))}});
  }, {timeout:20000});
  return order(actor, id);
}

export async function addNote(actor: Actor, id: string, text: string): Promise<InternalNoteDTO> {
  await order(actor, id);
  if(typeof text !== 'string' || !text.trim() || text.length>4000) throw new AdminOrderError(422);
  const note = await db.internalNote.create({ data: { orderId: id, authorId: actor.userId, text } });
  return { id: note.id, authorName: actor.userId, text: note.text, createdAt: note.createdAt.toISOString() };
}

export async function listAudit(actor: Actor, id: string) {
  await order(actor, id);
  return auditForOrder(id);
}

export async function createQuote(actor: Actor, id: string, input: any): Promise<QuoteDTO> {
  const parsed = CreateQuoteSchema.safeParse(input);
  if(!parsed.success) throw new AdminOrderError(422);
  input=parsed.data;
  const current = await order(actor, id);
  const quote = await db.$transaction(async tx => {
    const updated=await tx.order.updateMany({where:{id,revision:input.expectedVersion},data:{revision:{increment:1}}});
    if(!updated.count) throw new AdminOrderError(409);
    const latest=await tx.quote.findFirst({where:{orderId:id},orderBy:{revision:'desc'}});
    return tx.quote.create({data: { orderId: current.id, revision: (latest?.revision??0) + 1, currency: input.currency, amountMinor: BigInt(input.amountMinor), notes: input.notes ?? '' }});
  });
  return quoteDTO(quote);
}

export async function publishQuote(actor: Actor, id: string, expectedVersion: number): Promise<QuoteDTO> {
  staff(actor);
  const quote = await db.quote.findUnique({ where: { id }, include: { order: true } });
  if(quote && actor.role !== 'admin' && quote.order.organizationId !== actor.organizationId) throw new AdminOrderError(404);
  if (!quote || quote.order.revision !== expectedVersion) throw new AdminOrderError(quote ? 409 : 404);
  return quoteDTO(await db.$transaction(async tx => {
    const updated=await tx.order.updateMany({where:{id:quote.orderId,revision:expectedVersion},data:{revision:{increment:1}}});
    if(!updated.count) throw new AdminOrderError(409);
    await tx.quote.updateMany({where:{orderId:quote.orderId,status:'published',id:{not:id}},data:{status:'superseded'}});
    return tx.quote.update({where:{id},data:{status:'published',publishedAt:new Date()}});
  }));
}
