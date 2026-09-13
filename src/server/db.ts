import { PrismaClient } from '@prisma/client';
const singleton=globalThis as unknown as {prisma?:PrismaClient};
export const db=singleton.prisma??new PrismaClient();
if(process.env.NODE_ENV!=='production')singleton.prisma=db;
