import type { Actor } from '@/contracts/auth';
import type { AdminOrderDTO, AuditDTO, InternalNoteDTO } from '@/contracts/admin';
import type { CursorPage, OrderQuery, QuoteDTO } from '@/contracts';
import { db } from '@/server/db';
import { enqueueOutbox } from '@/server/outbox/worker';

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
    items: row.items.map((item: any) => ({ ...item, id: item.id })),
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
  quotes: true,
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
    reason: null,
    createdAt: event.createdAt.toISOString(),
    revision: 0,
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
      ...(after ? { OR: [{ submittedAt: { lt: after.date } }, { submittedAt: after.date, id: { lt: after.id } }] } : {}),
    },
    include: orderInclude,
    orderBy: [{ submittedAt: 'desc' }, { id: 'desc' }],
    take: query.limit + 1,
  });
  const next = rows[query.limit];
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
  const current = await order(actor, id);
  if (input.status === 'cancelled' && !input.reason) throw new AdminOrderError(422);
  const updated = await db.order.updateMany({
    where: { id: current.id, revision: input.expectedVersion },
    data: { status: input.status, revision: { increment: 1 } },
  });
  if (!updated.count) throw new AdminOrderError(409);
  const result = await order(actor, id);
  void notifyStatusChange(result).catch((error) => console.error('[NOTIFY] status change failed:', error?.message ?? error));
  return result;
}

export async function correctOrder(actor: Actor, id: string, input: any) {
  const current = await order(actor, id);
  const updated = await db.order.updateMany({
    where: { id: current.id, revision: input.expectedVersion },
    data: { sidemark: input.sidemark ?? current.sidemark, revision: { increment: 1 } },
  });
  if (!updated.count) throw new AdminOrderError(409);
  return order(actor, id);
}

export async function addNote(actor: Actor, id: string, text: string): Promise<InternalNoteDTO> {
  await order(actor, id);
  const note = await db.internalNote.create({ data: { orderId: id, authorId: actor.userId, text } });
  return { id: note.id, authorName: actor.userId, text: note.text, createdAt: note.createdAt.toISOString() };
}

export async function listAudit(actor: Actor, id: string) {
  await order(actor, id);
  return auditForOrder(id);
}

export async function createQuote(actor: Actor, id: string, input: any): Promise<QuoteDTO> {
  const current = await order(actor, id);
  const quote = await db.quote.create({
    data: { orderId: current.id, revision: current.quotes.length + 1, currency: input.currency, amountMinor: BigInt(input.amountMinor), notes: input.notes ?? '' },
  });
  return quoteDTO(quote);
}

export async function publishQuote(actor: Actor, id: string, expectedVersion: number): Promise<QuoteDTO> {
  staff(actor);
  const quote = await db.quote.findUnique({ where: { id }, include: { order: true } });
  if (!quote || quote.order.revision !== expectedVersion) throw new AdminOrderError(quote ? 409 : 404);
  return quoteDTO(await db.quote.update({ where: { id }, data: { status: 'published', publishedAt: new Date() } }));
}

async function notifyStatusChange(order: AdminOrderDTO) {
  const members = await db.membership.findMany({ where: { organizationId: order.organizationId }, include: { user: { select: { id: true, email: true } } } });
  const title = `Order ${order.number} is now ${order.status}`;
  const safeBody = `Your order ${order.number} (${order.sidemark}) changed status to ${order.status}.`;
  for (const member of members) {
    await db.notification.create({ data: { recipientId: member.user.id, orderId: order.id, type: 'order_status', title, safeBody } });
    await enqueueOutbox('email', { to: member.user.email, subject: title, html: `<p>${safeBody}</p>` });
  }
}
