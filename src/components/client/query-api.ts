import type { ClientOrderDTO, DashboardDTO, OrderQuery } from '@/contracts';
import { buildQuery, requestJson, type ClientPage } from './api';

export function getDashboard() {
  return requestJson<DashboardDTO>('/dashboard');
}

export function getOrders(query: Partial<OrderQuery> = {}) {
  return requestJson<ClientPage<ClientOrderDTO>>(`/orders${buildQuery({ q: query.q, status: query.status, cursor: query.cursor, limit: query.limit ? String(query.limit) : undefined })}`);
}

export function getOrder(id: string) {
  return requestJson<ClientOrderDTO>(`/orders/${encodeURIComponent(id)}`);
}
