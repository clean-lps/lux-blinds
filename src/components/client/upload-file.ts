import type { UploadIntentInput } from '@/contracts';
import { orderApi } from './order-api';

export async function uploadFile(file: File, purpose: UploadIntentInput['purpose']) {
  const hash = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  const sha256 = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
  const intent = await orderApi.createUploadIntent({ purpose, name: file.name, mediaType: file.type as UploadIntentInput['mediaType'], byteSize: file.size, sha256 });
  const response = await fetch(intent.url, { method: intent.method, headers: intent.headers, body: file });
  if (!response.ok) throw new Error('File transfer failed. Check storage permissions and try again.');
  await orderApi.completeUpload(intent.attachmentId, sha256);
  return intent;
}
