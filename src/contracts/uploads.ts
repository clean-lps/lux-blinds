import { z } from 'zod';
import { IdSchema } from './api';
export const UploadIntentSchema=z.strictObject({purpose:z.enum(['order_photo','tax_certificate']),resourceId:IdSchema.optional(),name:z.string().min(1).max(180),mediaType:z.enum(['image/jpeg','image/png','image/webp','application/pdf']),byteSize:z.number().int().positive().max(10_000_000),sha256:z.string().regex(/^[a-f0-9]{64}$/)});
export type UploadIntentInput=z.infer<typeof UploadIntentSchema>;
export type UploadIntentDTO={attachmentId:string;url:string;expiresAt:string;method:'PUT';headers:Record<string,string>};
export type AttachmentDTO={id:string;name:string;mediaType:string;byteSize:number;scanStatus:'pending'|'clean'|'rejected';uploadStatus:'pending'|'uploaded'|'failed'};
export type DownloadDTO={url:string;expiresAt:string};
export type PendingUploadActor={challengeId:string;capability:string};
