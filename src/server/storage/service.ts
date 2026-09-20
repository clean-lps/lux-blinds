import { createHash, randomUUID } from 'node:crypto';
import type { Actor } from '@/contracts/auth';
import type { AttachmentDTO, DownloadDTO, PendingUploadActor, UploadIntentDTO, UploadIntentInput } from '@/contracts/uploads';
import { UploadIntentSchema } from '@/contracts/uploads';
import { db } from '@/server/db';
import { scanQuarantinedObject } from '@/server/storage/scanner';
import { getObjectBytes, headObject, isS3Configured, presignGet, presignPut } from '@/server/storage/s3';

type UploadActor = Actor | PendingUploadActor;
type LocalObject = { bytes: Buffer; mediaType: string; expiresAt: Date };

const localObjects = new Map<string, LocalObject>();
const UPLOAD_EXPIRY_MS = 5 * 60 * 1000;
const DOWNLOAD_EXPIRY_MS = 60 * 1000;

export class UploadRejectedError extends Error {
  readonly status = 422;
  constructor() {
    super('Upload rejected');
  }
}

export class AttachmentNotFoundError extends Error {
  readonly status = 404;
  constructor() {
    super('Attachment not found');
  }
}

export class AttachmentForbiddenError extends Error {
  readonly status = 403;
  constructor() {
    super('Attachment access forbidden');
  }
}

function isActor(actor: UploadActor): actor is Actor {
  return 'userId' in actor;
}

function validateName(name: string, mediaType: UploadIntentInput['mediaType']): void {
  const extension = name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  const allowed = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'application/pdf': ['pdf'],
  }[mediaType];
  if (!extension || !allowed.includes(extension) || /[\\/\0<>:"|?*]/.test(name) || name.split('.').length > 2) throw new UploadRejectedError();
}

function validatePurpose(actor: UploadActor, input: UploadIntentInput): void {
  validateName(input.name, input.mediaType);
  if (input.purpose === 'tax_certificate') {
    if (input.resourceId || input.mediaType === 'image/webp') throw new UploadRejectedError();
    if (isActor(actor) && actor.role === 'operator') throw new AttachmentForbiddenError();
    return;
  }
  if (!isActor(actor) || input.mediaType === 'application/pdf') throw new UploadRejectedError();
}

function attachmentDto(attachment: { id: string; name: string; mediaType: string; byteSize: number; scanStatus: string; uploadStatus: string }): AttachmentDTO {
  const scanStatus = attachment.scanStatus;
  const uploadStatus = attachment.uploadStatus;
  if (!['pending', 'clean', 'rejected'].includes(scanStatus) || !['pending', 'uploaded', 'failed'].includes(uploadStatus)) throw new UploadRejectedError();
  return {
    id: attachment.id,
    name: attachment.name,
    mediaType: attachment.mediaType,
    byteSize: attachment.byteSize,
    scanStatus: scanStatus as AttachmentDTO['scanStatus'],
    uploadStatus: uploadStatus as AttachmentDTO['uploadStatus'],
  };
}

async function ownedAttachment(actor: UploadActor, attachmentId: string) {
  const attachment = await db.attachment.findUnique({ where: { id: attachmentId } });
  if (!attachment) throw new AttachmentNotFoundError();
  if (isActor(actor)) {
    if (actor.role === 'client' && attachment.organizationId !== actor.organizationId) throw new AttachmentNotFoundError();
    if (actor.role === 'operator' && attachment.purpose === 'tax_certificate') throw new AttachmentForbiddenError();
    return attachment;
  }
  if (attachment.challengeId !== actor.challengeId) throw new AttachmentNotFoundError();
  return attachment;
}

export async function createUploadIntent(actor: UploadActor, input: UploadIntentInput): Promise<UploadIntentDTO> {
  const parsed = UploadIntentSchema.safeParse(input);
  if (!parsed.success) throw new UploadRejectedError();
  const cleanInput = parsed.data;
  validatePurpose(actor, cleanInput);
  if (cleanInput.resourceId && isActor(actor)) {
    const order = await db.order.findFirst({ where: { id: cleanInput.resourceId, organizationId: actor.organizationId }, select: { id: true } });
    if (!order) throw new AttachmentNotFoundError();
  }

  const expiresAt = new Date(Date.now() + UPLOAD_EXPIRY_MS);
  const attachment = await db.attachment.create({
    data: {
      organizationId: isActor(actor) ? actor.organizationId : null,
      orderId: cleanInput.purpose === 'order_photo' ? cleanInput.resourceId : null,
      challengeId: isActor(actor) ? null : actor.challengeId,
      uploadedBy: isActor(actor) ? actor.userId : null,
      purpose: cleanInput.purpose,
      name: cleanInput.name,
      storageKey: `quarantine/${randomUUID()}`,
      mediaType: cleanInput.mediaType,
      byteSize: cleanInput.byteSize,
      sha256: cleanInput.sha256,
    },
  });
  localObjects.set(attachment.id, { bytes: Buffer.alloc(0), mediaType: cleanInput.mediaType, expiresAt });
  if (isS3Configured()) {
    const url = await presignPut(attachment.storageKey, cleanInput.mediaType);
    return { attachmentId: attachment.id, url, expiresAt: expiresAt.toISOString(), method: 'PUT', headers: { 'Content-Type': cleanInput.mediaType } };
  }
  return { attachmentId: attachment.id, url: `local-test://upload/${attachment.id}`, expiresAt: expiresAt.toISOString(), method: 'PUT', headers: {} };
}

/** Test adapter hook; it represents the object-store PUT behind a local-test intent. */
export function putLocalTestObject(attachmentId: string, bytes: Buffer, mediaType: string): void {
  const object = localObjects.get(attachmentId);
  if (!object || object.expiresAt <= new Date()) throw new UploadRejectedError();
  localObjects.set(attachmentId, { bytes, mediaType, expiresAt: object.expiresAt });
}

export async function completeUpload(actor: UploadActor, attachmentId: string, checksum: string): Promise<AttachmentDTO> {
  const attachment = await ownedAttachment(actor, attachmentId);

  if (isS3Configured()) {
    const head = await headObject(attachment.storageKey);
    if (!head || head.byteSize !== attachment.byteSize || (head.mediaType && head.mediaType !== attachment.mediaType)) {
      await db.attachment.update({ where: { id: attachment.id }, data: { uploadStatus: 'failed', scanStatus: 'rejected' } });
      throw new UploadRejectedError();
    }
    const bytes = await getObjectBytes(attachment.storageKey);
    if (!bytes || createHash('sha256').update(bytes).digest('hex') !== attachment.sha256) {
      await db.attachment.update({ where: { id: attachment.id }, data: { uploadStatus: 'failed', scanStatus: 'rejected' } });
      throw new UploadRejectedError();
    }
    const scanStatus = await scanQuarantinedObject(bytes);
    const updated = await db.attachment.update({
      where: { id: attachment.id },
      data: { uploadStatus: scanStatus === 'clean' ? 'uploaded' : 'failed', scanStatus },
    });
    if (scanStatus !== 'clean') throw new UploadRejectedError();
    return attachmentDto(updated);
  }

  const object = localObjects.get(attachment.id);
  const actualChecksum = object ? createHash('sha256').update(object.bytes).digest('hex') : null;
  if (!object || object.expiresAt <= new Date() || checksum !== attachment.sha256 || actualChecksum !== attachment.sha256 || object.bytes.length !== attachment.byteSize || object.mediaType !== attachment.mediaType) {
    await db.attachment.update({ where: { id: attachment.id }, data: { uploadStatus: 'failed', scanStatus: 'rejected' } });
    throw new UploadRejectedError();
  }

  const scanStatus = await scanQuarantinedObject(object.bytes);
  const updated = await db.attachment.update({
    where: { id: attachment.id },
    data: { uploadStatus: scanStatus === 'clean' ? 'uploaded' : 'failed', scanStatus },
  });
  if (scanStatus !== 'clean') throw new UploadRejectedError();
  return attachmentDto(updated);
}

export async function authorizeDownload(actor: Actor, attachmentId: string): Promise<DownloadDTO> {
  const attachment = await ownedAttachment(actor, attachmentId);
  if (attachment.scanStatus !== 'clean' || attachment.uploadStatus !== 'uploaded') throw new UploadRejectedError();
  const expiresAt = new Date(Date.now() + DOWNLOAD_EXPIRY_MS);
  if (isS3Configured()) {
    return { url: await presignGet(attachment.storageKey), expiresAt: expiresAt.toISOString() };
  }
  return { url: `local-test://download/${attachment.id}?expires=${expiresAt.toISOString()}`, expiresAt: expiresAt.toISOString() };
}
