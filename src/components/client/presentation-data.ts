import type { DashboardDTO, DraftDTO, ClientOrderDTO, OrderStatus } from '@/contracts';
import type { NotificationDTO, ProfileDTO, AttachmentDTO } from '@/contracts';

// MOCK DATA: presentation-only data derived from the repository fixtures.
// Production routes must replace this input with the real API response.
const ids = {
  orderOne: '00000000-0000-4000-8000-000000000100',
  orderTwo: '00000000-0000-4000-8000-000000000110',
  itemOne: '00000000-0000-4000-8000-000000000101',
  itemTwo: '00000000-0000-4000-8000-000000000111',
  draft: '00000000-0000-4000-8000-000000000300',
  notificationOne: '00000000-0000-4000-8000-000000000400',
  notificationTwo: '00000000-0000-4000-8000-000000000401',
  file: '00000000-0000-4000-8000-000000000200',
};

const previewAttachment: AttachmentDTO = {
  id: ids.file,
  name: 'demo.png',
  mediaType: 'image/png',
  byteSize: 68,
  scanStatus: 'clean',
  uploadStatus: 'uploaded',
};

const previewItem = {
  id: ids.itemOne,
  productType: 'Ripple Fold' as const,
  fabricName: 'Demo Linen 01',
  quantity: 2,
  widthEighths: 800,
  heightEighths: 672,
  opening: 'C/O' as const,
  trackSupplied: true,
  track: 'White' as const,
  fullness: '100%' as const,
  installation: 'Ceiling' as const,
  operation: 'Manual' as const,
  snapsSuggested: '27 / 27',
  snapsSource: 'auto' as const,
  ruleVersion: 'lux-observed-v1',
};

export const previewOrder: ClientOrderDTO = {
  id: ids.orderOne,
  number: 'DEMO-1001',
  sidemark: 'DEMO-001',
  status: 'received',
  revision: 1,
  submittedAt: '2026-09-13T12:00:00.000Z',
  items: [previewItem],
  specialNotes: 'Synthetic notification and order only.',
  attachments: [previewAttachment],
  publishedQuote: null,
};

export const previewOrders: ClientOrderDTO[] = [
  previewOrder,
  {
    ...previewOrder,
    id: ids.orderTwo,
    number: 'DEMO-1002',
    sidemark: 'DEMO-002',
    status: 'in_production',
    submittedAt: '2026-09-10T12:00:00.000Z',
    revision: 2,
    items: [{ ...previewItem, id: ids.itemTwo, productType: 'Roman Shades', snapsSuggested: null, snapsSource: null }],
  },
];

export const previewDraft: DraftDTO = {
  id: ids.draft,
  revision: 1,
  schemaVersion: 1,
  sidemark: '',
  items: [],
  builder: { productType: 'Other' },
  specialNotes: '',
  updatedAt: '2026-09-13T12:00:00.000Z',
  requiresPhotoReselection: true,
};

export const previewDashboard: DashboardDTO = {
  counts: { total: 2, received: 1, inProduction: 1, completed: 0 },
  completedDefinition: 'delivered-provisional',
  recentOrders: previewOrders,
  draft: { id: previewDraft.id, revision: previewDraft.revision, modelCount: previewDraft.items.length },
};

export const previewProfile: ProfileDTO = {
  id: '00000000-0000-4000-8000-000000000001',
  revision: 1,
  companyName: 'Demo Company',
  contactName: 'Demo Contact',
  phone: '0000000000',
  address: 'Synthetic address — not a real location',
  email: 'client@example.test',
  emailVerified: true,
  smsConsent: false,
  taxStatus: 'pending',
  certificateId: null,
};

export const previewNotifications: NotificationDTO[] = [
  {
    id: ids.notificationOne,
    title: 'Demo order received',
    body: 'Synthetic notification only.',
    orderId: ids.orderOne,
    readAt: null,
    createdAt: '2026-09-13T12:00:00.000Z',
  },
  {
    id: ids.notificationTwo,
    title: 'Production update',
    body: 'Synthetic status update for presentation.',
    orderId: ids.orderTwo,
    readAt: '2026-09-12T12:00:00.000Z',
    createdAt: '2026-09-12T12:00:00.000Z',
  },
];

export const previewStatusOrder: OrderStatus[] = ['received', 'in_production', 'ready_for_installation', 'delivered', 'cancelled'];
