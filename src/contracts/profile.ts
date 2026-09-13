import { z } from 'zod';
import { VersionSchema } from './api';
export const UpdateProfileSchema=z.strictObject({expectedVersion:VersionSchema,companyName:z.string().trim().min(1).max(160),contactName:z.string().trim().min(1).max(160),phone:z.string().min(5).max(32),address:z.string().max(1000)});
export type UpdateProfileInput=z.infer<typeof UpdateProfileSchema>;
export type ProfileDTO=Omit<UpdateProfileInput,'expectedVersion'>&{id:string;revision:number;email:string;emailVerified:boolean;smsConsent:boolean;taxStatus:'pending'|'approved'|'rejected';certificateId:string|null};
