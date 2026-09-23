import { PrismaClient } from '@prisma/client';
import { hashPassword } from 'better-auth/crypto';
import { getInitialAdminConfig } from '../src/server/bootstrap/initial-admin';

const prisma = new PrismaClient();
const BOOTSTRAP_ORGANIZATION_ID = '00000000-0000-4000-8000-000000000001';

async function main() {
  const config = getInitialAdminConfig();
  const administrators = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { id: true, email: true },
  });

  if (administrators.length > 1) {
    throw new Error('Bootstrap stopped: more than one administrator already exists. Resolve this manually.');
  }

  if (!config) {
    if (administrators.length === 1) {
      console.log(`An administrator already exists (${administrators[0].email}); bootstrap skipped.`);
      return;
    }
    throw new Error('Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD for the first production deploy.');
  }

  if (administrators.length === 1 && administrators[0].email !== config.email) {
    throw new Error(`Bootstrap stopped: administrator ${administrators[0].email} already exists.`);
  }

  const organization = await prisma.organization.upsert({
    where: { id: BOOTSTRAP_ORGANIZATION_ID },
    update: {},
    create: {
      id: BOOTSTRAP_ORGANIZATION_ID,
      companyName: 'LUX Blinds',
      contactName: config.name,
      phone: 'not-configured',
      address: '',
      taxStatus: 'approved',
    },
  });

  const administrator = await prisma.user.upsert({
    where: { email: config.email },
    update: {
      name: config.name,
      emailVerified: true,
      role: 'admin',
      disabledAt: null,
    },
    create: {
      name: config.name,
      email: config.email,
      emailVerified: true,
      role: 'admin',
    },
  });

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: administrator.id, organizationId: organization.id } },
    update: {},
    create: { userId: administrator.id, organizationId: organization.id },
  });

  const credential = await prisma.account.findFirst({
    where: { userId: administrator.id, providerId: 'credential' },
    select: { id: true },
  });
  if (!credential) {
    await prisma.account.create({
      data: {
        accountId: administrator.id,
        providerId: 'credential',
        userId: administrator.id,
        password: await hashPassword(config.password),
      },
    });
  }

  console.log(`Production administrator is ready: ${administrator.email}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
