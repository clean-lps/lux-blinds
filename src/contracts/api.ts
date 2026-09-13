import { z } from 'zod';
export const IdSchema=z.uuid();
export const VersionSchema=z.number().int().min(1);
export const QuerySchema=z.object({q:z.string().trim().max(200).optional(),cursor:z.string().max(200).optional(),limit:z.coerce.number().int().min(1).max(50).default(20)});
export type ApiError={error:{code:string;message:string;fieldErrors?:Record<string,string[]>;retryable:boolean};requestId:string};
export type ApiResponse<T>={data:T;requestId:string};
export type CursorPage<T>={data:T[];page:{nextCursor:string|null};requestId:string};
export type ValidationResult<T>={success:true;data:T}|{success:false;fieldErrors:Record<string,string[]>};
