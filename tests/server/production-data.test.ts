import { beforeEach, expect, it, vi } from 'vitest';
const db = vi.hoisted(() => ({ order: { findMany: vi.fn(), count: vi.fn(), findFirst: vi.fn() }, draft: { findFirst: vi.fn() } }));
vi.mock('@/server/db', () => ({ db }));
import { getDashboard, getOrder, listOrders } from '@/server/orders/queries';
import { orderItemDTO } from '@/server/orders/item-dto';
import { ripple } from '../fixtures/catalog';
import { OrderItemSchema } from '@/contracts/product-rules';
const actor = { userId: 'u', organizationId: 'org', role: 'client' as const };
const row = (id: string) => ({ id, number: id, sidemark: 'Real', status: 'received', revision: 1, submittedAt: new Date('2026-09-01'), specialNotes: '', items: [], attachments: [], quotes: [] });
beforeEach(() => vi.resetAllMocks());
it('maps database models back to editable contract inputs without nulls or internal columns', () => {
  const {id,snapsSuggested,snapsSource,ruleVersion,...input}=orderItemDTO({...ripple,id:'item',orderId:'order',position:0,unit:'in',productOther:null,ruleVersion:'v1'});
  expect(OrderItemSchema.safeParse(input).success).toBe(true);
  expect(input).not.toHaveProperty('orderId');expect(input).not.toHaveProperty('unit');
});
it('counts all orders, not just the five recent orders', async () => {
  db.order.findMany.mockResolvedValue([row('1')]); db.draft.findFirst.mockResolvedValue(null);
  db.order.count.mockResolvedValueOnce(12).mockResolvedValueOnce(7).mockResolvedValueOnce(3).mockResolvedValueOnce(2);
  expect((await getDashboard(actor)).counts).toEqual({ total: 12, received: 7, inProduction: 3, completed: 2 });
});
it('cursors point at the last included row so no order is skipped', async () => {
  db.order.findMany.mockResolvedValue([row('3'), row('2'), row('1')]);
  expect((await listOrders(actor, { limit: 2 })).page.nextCursor).toBe('2026-09-01T00:00:00.000Z:2');
});
it('returns real attachments and published prices without storage keys', async () => {
  db.order.findFirst.mockResolvedValue({ ...row('1'), attachments: [{ id: 'a', name: 'photo.jpg', mediaType: 'image/jpeg', byteSize: 5, scanStatus: 'clean', uploadStatus: 'uploaded', storageKey: 'private' }], quotes: [{ id: 'q', revision: 1, currency: 'USD', amountMinor: 12500n, status: 'published', notes: '', publishedAt: new Date('2026-09-01') }] });
  const result = await getOrder(actor, '1');
  expect(result.attachments).toHaveLength(1); expect(result.attachments[0]).not.toHaveProperty('storageKey');
  expect(result.publishedQuote?.amountMinor).toBe('12500');
});
