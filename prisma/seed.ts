import { PrismaClient } from '@prisma/client';
import { hashPassword } from 'better-auth/crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      companyName: 'Demo Company',
      contactName: 'Demo User',
      phone: '+1 555 0100',
      address: '123 Demo Street, Demo City',
      taxStatus: 'approved',
    },
  });

  // Create demo admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@luxblinds.demo' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000010',
      name: 'Admin User',
      email: 'admin@luxblinds.demo',
      emailVerified: true,
      role: 'admin',
    },
  });

  // Create demo client user
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@luxblinds.demo' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000020',
      name: 'Client User',
      email: 'client@luxblinds.demo',
      emailVerified: true,
      role: 'client',
    },
  });

  // Create memberships
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: adminUser.id, organizationId: org.id } },
    update: {},
    create: { userId: adminUser.id, organizationId: org.id },
  });

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: clientUser.id, organizationId: org.id } },
    update: {},
    create: { userId: clientUser.id, organizationId: org.id },
  });
  // Create demo account for client (password: demo12345678)
  // NOTE: must use Better Auth's own hasher (scrypt), otherwise signInEmail rejects it.
  const passwordHash = await hashPassword('demo12345678');

  const existingClientAccount = await prisma.account.findFirst({
    where: { userId: clientUser.id, providerId: 'credential' },
  });
  if (existingClientAccount) {
    await prisma.account.update({ where: { id: existingClientAccount.id }, data: { password: passwordHash } });
  } else {
    await prisma.account.create({
      data: {
        id: '00000000-0000-4000-8000-000000000030',
        accountId: clientUser.id,
        providerId: 'credential',
        userId: clientUser.id,
        password: passwordHash,
      },
    });
  }

  // Create demo account for admin (password: demo12345678)
  const existingAdminAccount = await prisma.account.findFirst({
    where: { userId: adminUser.id, providerId: 'credential' },
  });
  if (existingAdminAccount) {
    await prisma.account.update({ where: { id: existingAdminAccount.id }, data: { password: passwordHash } });
    console.log('Updated admin account password:', existingAdminAccount.id);
  } else {
    await prisma.account.create({
      data: {
        id: '00000000-0000-4000-8000-000000000031',
        accountId: adminUser.id,
        providerId: 'credential',
        userId: adminUser.id,
        password: passwordHash,
      },
    });
    console.log('Created admin account');
  }

   // Create demo order
  await prisma.order.upsert({
    where: { id: '00000000-0000-4000-8000-000000000100' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000100',
      number: 'ORD-DEMO-001',
      organizationId: org.id,
      createdBy: clientUser.id,
      sidemark: 'Demo Order',
      status: 'received',
      specialNotes: 'This is a demo order',
      items: {
        create: {
          position: 1,
          quantity: 2,
          productType: 'Ripple Fold',
          fabricName: 'Demo Linen',
          widthEighths: 800,
          heightEighths: 672,
          trackSupplied: true,
          ruleVersion: 'lux-observed-v1',
        },
      },
    },
  });

  console.log('Seed completed!');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Admin:  admin@luxblinds.demo / demo12345678');
  console.log('  Client: client@luxblinds.demo / demo12345678');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
