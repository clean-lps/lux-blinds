require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaNeonHttp } = require('@prisma/adapter-neon');

const url = process.env.DATABASE_URL;
console.log('Using DATABASE_URL:', url ? url.substring(0, 50) + '...' : 'UNDEFINED');

const adapter = new PrismaNeonHttp(url, { fullResults: true });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'danolight007@gmail.com';
  
  // Clean up Accounts
  const deletedAccounts = await prisma.account.deleteMany({
    where: { user: { email: email } }
  });
  console.log('Deleted accounts count:', deletedAccounts.count);

  // Clean up Memberships
  const deletedMemberships = await prisma.membership.deleteMany({
    where: { user: { email: email } }
  });
  console.log('Deleted memberships count:', deletedMemberships.count);

  // Clean up Sessions
  const deletedSessions = await prisma.session.deleteMany({
    where: { user: { email: email } }
  });
  console.log('Deleted sessions count:', deletedSessions.count);

  // Clean up Users
  const deletedUsers = await prisma.user.deleteMany({
    where: { email: email }
  });
  console.log('Deleted users count:', deletedUsers.count);

  // Clean up Verifications
  const deletedVerifications = await prisma.verification.deleteMany({
    where: { identifier: { startsWith: 'register:' + email } }
  });
  console.log('Deleted verifications count:', deletedVerifications.count);

  console.log('Deletion script complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
