import type { CreateOrderInput, DraftDTO, DraftVersionDTO, SaveDraftInput, UploadIntentDTO, UploadIntentInput, ClientOrderDTO } from '@/contracts';
import { requestJson, type ClientPage } from './api';

export const orderApi = {
  getDraft() {
    return requestJson<DraftDTO>('/draft');
  },
  saveDraft(input: SaveDraftInput) {
    return requestJson<DraftDTO>('/draft', { method: 'PUT', body: JSON.stringify(input) });
  },
  getDraftVersions(cursor?: string) {
    return requestJson<ClientPage<DraftVersionDTO>>(`/draft/versions${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`);
  },
  restoreDraft(versionId: string, expectedRevision: number) {
    return requestJson<DraftDTO>('/draft/restore', { method: 'POST', body: JSON.stringify({ versionId, expectedRevision }) });
  },
  createOrder(input: CreateOrderInput, idempotencyKey: string) {
    return requestJson<ClientOrderDTO>('/orders', { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify(input) });
  },
  createUploadIntent(input: UploadIntentInput) {
    return requestJson<UploadIntentDTO>('/uploads/intents', { method: 'POST', body: JSON.stringify(input) });
  },
  completeUpload(attachmentId: string, checksum: string) {
    return requestJson<void>(`/uploads/${attachmentId}/complete`, { method: 'POST', body: JSON.stringify({ checksum }) });
  },
};
