import type {AdminOrderDTO, AuditDTO, ChangeStatusInput, CorrectOrderInput, CreateQuoteInput, InternalNoteDTO} from '@/contracts/admin';
import type {ApiError, CursorPage} from '@/contracts/api';
import type {DownloadDTO} from '@/contracts/uploads';
import type {QuoteDTO} from '@/contracts/orders';
import {createPreviewAdminData, type AdminFixtureData, type ApiResponse} from './admin-api';

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export class OrderDetailApiRequestError extends Error {
  constructor(public readonly status: number, public readonly payload: unknown) {
    const message = isApiError(payload) ? payload.error.message : `Request failed with status ${status}`;
    super(message);
    this.name = 'OrderDetailApiRequestError';
  }
}

function isApiError(payload: unknown): payload is ApiError {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) return false;
  const error = (payload as {error?: unknown}).error;
  return Boolean(error && typeof error === 'object' && 'message' in error);
}

async function requestJson<T>(fetcher: Fetcher, input: string, init?: RequestInit): Promise<T> {
  const response = await fetcher(input, { ...init, headers: {'Accept': 'application/json', ...(init?.headers ?? {})} });
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) throw new OrderDetailApiRequestError(response.status, payload);
  return payload as T;
}

export type OrderDetailApi = {
  getOrder(id: string): Promise<ApiResponse<AdminOrderDTO>>;
  correctOrder(id: string, input: CorrectOrderInput): Promise<ApiResponse<AdminOrderDTO>>;
  changeStatus(id: string, input: ChangeStatusInput): Promise<ApiResponse<AdminOrderDTO>>;
  addNote(id: string, text: string): Promise<ApiResponse<InternalNoteDTO>>;
  getAudit(id: string, cursor?: string): Promise<CursorPage<AuditDTO>>;
  createQuote(id: string, input: CreateQuoteInput): Promise<ApiResponse<QuoteDTO>>;
  publishQuote(quoteId: string, expectedVersion: number): Promise<ApiResponse<QuoteDTO>>;
  downloadAttachment(id: string): Promise<ApiResponse<DownloadDTO>>;
};

export function createOrderDetailApi(fetcher: Fetcher = fetch): OrderDetailApi {
  return {
    getOrder: (id) => requestJson<ApiResponse<AdminOrderDTO>>(fetcher, `/api/v1/admin/orders/${encodeURIComponent(id)}`),
    correctOrder: (id, input) => requestJson<ApiResponse<AdminOrderDTO>>(fetcher, `/api/v1/admin/orders/${encodeURIComponent(id)}`, {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(input)}),
    changeStatus: (id, input) => requestJson<ApiResponse<AdminOrderDTO>>(fetcher, `/api/v1/admin/orders/${encodeURIComponent(id)}/status`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(input)}),
    addNote: (id, text) => requestJson<ApiResponse<InternalNoteDTO>>(fetcher, `/api/v1/admin/orders/${encodeURIComponent(id)}/notes`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({text})}),
    getAudit: (id, cursor) => requestJson<CursorPage<AuditDTO>>(fetcher, `/api/v1/admin/orders/${encodeURIComponent(id)}/audit${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`),
    createQuote: (id, input) => requestJson<ApiResponse<QuoteDTO>>(fetcher, `/api/v1/admin/orders/${encodeURIComponent(id)}/quotes`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(input)}),
    publishQuote: (quoteId, expectedVersion) => requestJson<ApiResponse<QuoteDTO>>(fetcher, `/api/v1/admin/quotes/${encodeURIComponent(quoteId)}/publish`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({expectedVersion})}),
    downloadAttachment: (id) => requestJson<ApiResponse<DownloadDTO>>(fetcher, `/api/v1/attachments/${encodeURIComponent(id)}/download`),
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function conflict(message = 'A newer order version is available.'): never {
  throw new OrderDetailApiRequestError(409, {error: {code: 'conflict', message, retryable: false}, requestId: 'preview-conflict'} satisfies ApiError);
}

export function createFixtureOrderDetailApi(source: AdminFixtureData = createPreviewAdminData()): OrderDetailApi {
  const data = clone(source);
  const findOrder = (id: string) => {
    const item = data.orders.find((order) => order.id === id);
    if (!item) throw new OrderDetailApiRequestError(404, {error: {code: 'not_found', message: 'Order not found', retryable: false}, requestId: 'preview-not-found'} satisfies ApiError);
    return item;
  };
  const revise = (order: AdminOrderDTO, action: string, reason: string | null, changes: Record<string, {before: unknown;after: unknown}>) => {
    order.revision += 1;
    order.audit.unshift({id: `preview-audit-${order.revision}-${order.id}`, actorName: 'Demo Operator', action, reason, createdAt: new Date().toISOString(), revision: order.revision, changes});
  };
  const checkVersion = (order: AdminOrderDTO, expectedVersion: number) => {
    if (order.revision !== expectedVersion) conflict();
  };

  return {
    async getOrder(id) {
      return {data: clone(findOrder(id)), requestId: 'preview-order-detail'};
    },
    async correctOrder(id, input) {
      const order = findOrder(id);
      checkVersion(order, input.expectedVersion);
      const before = {sidemark: order.sidemark, items: order.items};
      if (input.sidemark) order.sidemark = input.sidemark;
      if (input.items) order.items = input.items.map((item, index) => ({...order.items[index], ...item, id: order.items[index]?.id ?? `preview-item-${index}`}));
      revise(order, 'Order corrected', input.reason, {sidemark: {before: before.sidemark, after: order.sidemark}, items: {before: before.items, after: order.items}});
      return {data: clone(order), requestId: 'preview-order-corrected'};
    },
    async changeStatus(id, input) {
      const order = findOrder(id);
      checkVersion(order, input.expectedVersion);
      const before = order.status;
      order.status = input.status;
      revise(order, 'Status changed', input.reason ?? null, {status: {before, after: order.status}});
      return {data: clone(order), requestId: 'preview-order-status'};
    },
    async addNote(id, text) {
      const order = findOrder(id);
      const note: InternalNoteDTO = {id: `preview-note-${order.internalNotes.length + 1}`, authorName: 'Demo Operator', text, createdAt: new Date().toISOString()};
      order.internalNotes.push(note);
      return {data: clone(note), requestId: 'preview-order-note'};
    },
    async getAudit(id) {
      return {data: clone(findOrder(id).audit), page: {nextCursor: null}, requestId: 'preview-order-audit'};
    },
    async createQuote(id, input) {
      const order = findOrder(id);
      checkVersion(order, input.expectedVersion);
      const quote: QuoteDTO = {id: `00000000-0000-4000-8000-0000000006${order.quotes.length + 1}0`, revision: order.quotes.length + 1, currency: input.currency, amountMinor: input.amountMinor, status: 'draft', notes: input.notes, publishedAt: null};
      order.quotes.unshift(quote);
      revise(order, 'Quote prepared', input.notes || null, {quote: {before: null, after: quote}});
      return {data: clone(quote), requestId: 'preview-quote-created'};
    },
    async publishQuote(quoteId, expectedVersion) {
      const order = data.orders.find((item) => item.quotes.some((quote) => quote.id === quoteId));
      if (!order) throw new OrderDetailApiRequestError(404, {error: {code: 'not_found', message: 'Quote not found', retryable: false}, requestId: 'preview-not-found'} satisfies ApiError);
      checkVersion(order, expectedVersion);
      const quote = order.quotes.find((item) => item.id === quoteId)!;
      quote.publishedAt = new Date().toISOString();
      quote.status = 'published';
      order.publishedQuote = quote;
      revise(order, 'Quote published', 'Manual quote confirmed by staff.', {publishedAt: {before: null, after: quote.publishedAt}});
      return {data: clone(quote), requestId: 'preview-quote-published'};
    },
    async downloadAttachment(id) {
      const order = data.orders.find((item) => item.attachments.some((attachment) => attachment.id === id));
      if (!order) throw new OrderDetailApiRequestError(404, {error: {code: 'not_found', message: 'Attachment not found', retryable: false}, requestId: 'preview-not-found'} satisfies ApiError);
      return {data: {url: '#preview-only', expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()}, requestId: 'preview-download'};
    },
  };
}
