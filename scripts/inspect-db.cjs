require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaNeonHttp } = require('@prisma/adapter-neon');

const url = process.env.DATABASE_URL;
console.log('Using DATABASE_URL:', url ? url.substring(0, 50) + '...' : 'UNDEFINED');

const adapter = new PrismaNeonHttp(url, { fullResults: true });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany();
  console.log('--- USERS IN DB ---');
  console.log(users.map(u => ({ id: u.id, email: u.email, role: u.role })));
  
  const accounts = await prisma.account.findMany();
  console.log('--- ACCOUNTS IN DB ---');
  console.log(accounts.map(a => ({ id: a.id, userId: a.userId, accountId: a.accountId, providerId: a.providerId, passwordLength: a.password ? a.password.length : 0, passwordStart: a.password ? a.password.substring(0, 10) : 'null' })));

  const verifications = await prisma.verification.findMany();
  console.log('--- VERIFICATIONS IN DB ---');
  console.log(verifications.map(v => ({ id: v.id, identifier: v.identifier, value: v.value.substring(0, 30) + '...' })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
