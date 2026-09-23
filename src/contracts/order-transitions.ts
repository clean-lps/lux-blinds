import type { OrderStatus } from './orders';
export const orderTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  received: ['in_production', 'cancelled'], in_production: ['ready_for_installation', 'cancelled'],
  ready_for_installation: ['delivered', 'cancelled'], delivered: [], cancelled: [],
};
