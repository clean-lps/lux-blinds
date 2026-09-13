import type { Actor } from '@/contracts/auth';
export const client:Actor={userId:'00000000-0000-4000-8000-000000000001',organizationId:'00000000-0000-4000-8000-000000000010',role:'client'};
export const otherClient:Actor={userId:'00000000-0000-4000-8000-000000000002',organizationId:'00000000-0000-4000-8000-000000000020',role:'client'};
export const operator:Actor={...client,userId:'00000000-0000-4000-8000-000000000003',role:'operator'};
export const admin:Actor={...client,userId:'00000000-0000-4000-8000-000000000004',role:'admin'};
