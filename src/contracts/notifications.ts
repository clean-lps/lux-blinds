import { z } from 'zod';
export type NotificationDTO={id:string;title:string;body:string;orderId:string|null;readAt:string|null;createdAt:string};
export const ConsentSchema=z.strictObject({channel:z.enum(['email','sms']),granted:z.boolean(),wordingVersion:z.string().min(1).max(80)});
export const NotificationReadSchema=z.strictObject({read:z.literal(true)});
export const NotificationBulkSchema=z.strictObject({beforeTimestamp:z.iso.datetime()});
export type ConsentInput=z.infer<typeof ConsentSchema>;
export type OutboxEvent={id:string;recipientId:string;type:string;channel:'email'|'sms'|'in_app';payload:Record<string,string>};
