import type { AdminCustomerDTO, AdminOrderDTO, ReviewTaxInput } from '@/contracts/admin';
import type { ApiError, CursorPage } from '@/contracts/api';
import type { OrderStatus } from '@/contracts/orders';

export type AdminOrderQuery = {
  q?: string;
  status?: OrderStatus;
  cursor?: string;
  limit?: number;
};

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export class AdminApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    const message = isApiError(payload) ? payload.error.message : `Request failed with status ${status}`;
    super(message);
    this.name = 'AdminApiRequestError';
  }
}

function isApiError(payload: unknown): payload is ApiError {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) return false;
  const error = (payload as {error?: unknown}).error;
  return Boolean(error && typeof error === 'object' && 'message' in error);
}

async function requestJson<T>(fetcher: Fetcher, input: string, init?: RequestInit): Promise<T> {
  const response = await fetcher(input, {
    ...init,
    headers: {'Accept': 'application/json', ...(init?.headers ?? {})},
  });
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) throw new AdminApiRequestError(response.status, payload);
  return payload as T;
}

function queryString(query: AdminOrderQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.status) params.set('status', query.status);
  if (query.cursor) params.set('cursor', query.cursor);
  if (query.limit) params.set('limit', String(query.limit));
  const value = params.toString();
  return value ? `?${value}` : '';
}

export type AdminApi = {
  listOrders(query?: AdminOrderQuery): Promise<CursorPage<AdminOrderDTO>>;
  listCustomers(query?: Pick<AdminOrderQuery, 'q' | 'cursor' | 'limit'>): Promise<CursorPage<AdminCustomerDTO>>;
  getCustomer(id: string): Promise<ApiResponse<AdminCustomerDTO>>;
  reviewTax(id: string, input: ReviewTaxInput): Promise<ApiResponse<AdminCustomerDTO>>;
};

export type ApiResponse<T> = {data: T;requestId: string};

export function createAdminApi(fetcher: Fetcher = fetch): AdminApi {
  return {
    listOrders: (query = {}) => requestJson<CursorPage<AdminOrderDTO>>(fetcher, `/api/v1/admin/orders${queryString(query)}`),
    listCustomers: (query = {}) => requestJson<CursorPage<AdminCustomerDTO>>(fetcher, `/api/v1/admin/customers${queryString(query)}`),
    getCustomer: (id) => requestJson<ApiResponse<AdminCustomerDTO>>(fetcher, `/api/v1/admin/customers/${encodeURIComponent(id)}`),
    reviewTax: (id, input) => requestJson<ApiResponse<AdminCustomerDTO>>(fetcher, `/api/v1/admin/customers/${encodeURIComponent(id)}/tax-review`, {method: 'POST',headers: {'Content-Type': 'application/json'},body: JSON.stringify(input)}),
  };
}

export type AdminFixtureData = {orders: AdminOrderDTO[];customers: AdminCustomerDTO[]};

const previewOrderItem: AdminOrderDTO['items'][number] = {
  id: '00000000-0000-4000-8000-000000000101',
  productType: 'Ripple Fold',
  fabricName: 'Demo Linen 01',
  quantity: 2,
  widthEighths: 800,
  heightEighths: 672,
  opening: 'C/O',
  trackSupplied: true,
  track: 'White',
  fullness: '100%',
  installation: 'Ceiling',
  operation: 'Manual',
  snapsSuggested: '27 / 27',
  snapsSource: 'auto',
  ruleVersion: 'lux-observed-v1',
};

function previewOrder(overrides: Partial<AdminOrderDTO> = {}): AdminOrderDTO {
  return {
    id: '00000000-0000-4000-8000-000000000100',
    number: 'DEMO-1002',
    sidemark: 'Ocean residence',
    status: 'in_production',
    revision: 3,
    submittedAt: '2026-09-13T12:00:00.000Z',
    items: [previewOrderItem],
    specialNotes: 'Confirm the track finish before production.',
    attachments: [
      {id: '00000000-0000-4000-8000-000000000200', name: 'measurement-demo.pdf', mediaType: 'application/pdf', byteSize: 245760, scanStatus: 'clean', uploadStatus: 'uploaded'},
      {id: '00000000-0000-4000-8000-000000000201', name: 'window-demo.png', mediaType: 'image/png', byteSize: 86016, scanStatus: 'clean', uploadStatus: 'uploaded'},
    ],
    publishedQuote: null,
    organizationId: '00000000-0000-4000-8000-000000000010',
    customerName: 'Atelier Demo',
    internalNotes: [{id: '00000000-0000-4000-8000-000000000301', authorName: 'Demo Operator', text: 'Review the track finish before production.', createdAt: '2026-09-13T14:30:00.000Z'}],
    audit: [{id: '00000000-0000-4000-8000-000000000401', actorName: 'Demo Operator', action: 'Status changed', reason: 'Production planning confirmed.', createdAt: '2026-09-13T14:30:00.000Z', revision: 3, changes: {status: {before: 'received', after: 'in_production'}}}],
    quotes: [],
    ...overrides,
  };
}

export function createPreviewAdminData(): AdminFixtureData {
  return {
    orders: [
      previewOrder(),
      previewOrder({id: '00000000-0000-4000-8000-000000000110', number: 'DEMO-1003', customerName: 'Studio Example', sidemark: 'Lobby west', status: 'received', revision: 1, organizationId: '00000000-0000-4000-8000-000000000020'}),
      previewOrder({id: '00000000-0000-4000-8000-000000000120', number: 'DEMO-1001', customerName: 'Atelier Demo', sidemark: 'Garden room', status: 'ready_for_installation', revision: 2, organizationId: '00000000-0000-4000-8000-000000000010'}),
    ],
    customers: [
      {id: '00000000-0000-4000-8000-000000000010', revision: 1, companyName: 'Atelier Demo', contactName: 'Demo Contact', phone: '+1 555 0100', address: 'Demo address', email: 'customer@example.test', emailVerified: true, smsConsent: false, taxStatus: 'pending', certificateId: '00000000-0000-4000-8000-000000000501', orderCount: 2, organizationId: '00000000-0000-4000-8000-000000000010'},
      {id: '00000000-0000-4000-8000-000000000020', revision: 1, companyName: 'Studio Example', contactName: 'Second Contact', phone: '+1 555 0101', address: 'Example address', email: 'contact2@example.test', emailVerified: true, smsConsent: true, taxStatus: 'approved', certificateId: '00000000-0000-4000-8000-000000000502', orderCount: 1, organizationId: '00000000-0000-4000-8000-000000000020'},
    ],
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createFixtureAdminApi(source = createPreviewAdminData()): AdminApi {
  const data = clone(source);
  return {
    async listOrders(query = {}) {
      const normalized = query.q?.toLowerCase();
      const filtered = data.orders.filter((item) => {
        const matchesQuery = !normalized || [item.number, item.customerName, item.sidemark].some((value) => value.toLowerCase().includes(normalized));
        return matchesQuery && (!query.status || item.status === query.status);
      });
      return {data: clone(filtered), page: {nextCursor: null}, requestId: 'preview-admin-orders'};
    },
    async listCustomers(query = {}) {
      const normalized = query.q?.toLowerCase();
      const filtered = data.customers.filter((item) => !normalized || [item.companyName, item.contactName, item.email].some((value) => value.toLowerCase().includes(normalized)));
      return {data: clone(filtered), page: {nextCursor: null}, requestId: 'preview-admin-customers'};
    },
    async getCustomer(id) {
      const customer = data.customers.find((item) => item.id === id);
      if (!customer) throw new AdminApiRequestError(404, {error: {code: 'not_found', message: 'Customer not found', retryable: false}, requestId: 'preview-not-found'} satisfies ApiError);
      return {data: clone(customer), requestId: 'preview-admin-customer'};
    },
    async reviewTax(id, input) {
      const customer = data.customers.find((item) => item.id === id);
      if (!customer) throw new AdminApiRequestError(404, {error: {code: 'not_found', message: 'Customer not found', retryable: false}, requestId: 'preview-not-found'} satisfies ApiError);
      if (customer.revision !== input.expectedVersion) throw new AdminApiRequestError(409, {error: {code: 'conflict', message: 'A newer customer version is available.', retryable: false}, requestId: 'preview-conflict'} satisfies ApiError);
      Object.assign(customer, {taxStatus: input.status, certificateId: input.certificateId, revision: customer.revision + 1});
      return {data: clone(customer), requestId: 'preview-tax-review'};
    },
  };
}
