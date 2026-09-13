import { z } from 'zod';
export const ProductTypeSchema=z.enum(['Roller','Zebra','Ripple Fold','Pinch Pleat','Roman Shades','Other']);
export const OpeningSchema=z.enum(['C/O','O/W L','O/W R','Crazy Track. O/W','Crazy Track . C/O']);
export const FullnessSchema=z.enum(['80%','100%','120%']);
export const OrderItemSchema=z.strictObject({productType:ProductTypeSchema,productOther:z.string().trim().max(120).optional(),roomArea:z.string().max(160).optional(),fabricName:z.string().trim().min(1).max(160),quantity:z.number().int().positive().max(Number.MAX_SAFE_INTEGER),widthEighths:z.number().int().positive().max(Number.MAX_SAFE_INTEGER),heightEighths:z.number().int().positive().max(Number.MAX_SAFE_INTEGER),opening:OpeningSchema.optional(),trackSupplied:z.boolean(),track:z.enum(['White','Black','Rod','Other']).optional(),trackOther:z.string().max(120).optional(),fullness:FullnessSchema.optional(),installation:z.enum(['Ceiling','Wall','IB','OB']).optional(),controlSide:z.enum(['Left','Right']).optional(),operation:z.enum(['Manual','Motorized','Cord']).optional(),snapsManual:z.string().trim().max(80).optional(),notes:z.string().max(4000).optional()});
export type ProductType=z.infer<typeof ProductTypeSchema>;
export type OrderItemInput=z.infer<typeof OrderItemSchema>;
export type NormalizedOrderItem=OrderItemInput&{snapsSuggested:string|null;snapsSource:'manual'|'auto'|null;ruleVersion:string};
export type SnapsInput={widthEighths:number;opening:z.infer<typeof OpeningSchema>|null;fullness:z.infer<typeof FullnessSchema>|null};
// Structural schema only. P01 supplies conditional product validation and normalization.
