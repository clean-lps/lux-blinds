const { PrismaClient } = require('@prisma/client');
const { PrismaNeonHttp } = require('@prisma/adapter-neon');
const prisma = new PrismaClient({ adapter: new PrismaNeonHttp(process.env.DATABASE_URL, { fullResults: true }) });
(async () => {
  try {
    const email = process.argv[2];
    if (!email) { console.log('Uso: node scripts/cleanup.cjs <email>'); return; }
    console.log('Buscando usuario:', email);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) { console.log('Usuario no encontrado.'); return; }
    console.log('Usuario encontrado:', user.id, user.email);
    await prisma.session.deleteMany({ where: { userId: user.id } });
    console.log('Sessions eliminadas');
    await prisma.membership.deleteMany({ where: { userId: user.id } });
    console.log('Memberships eliminadas');
    await prisma.account.deleteMany({ where: { userId: user.id } });
    console.log('Accounts eliminadas');
    await prisma.notification.deleteMany({ where: { recipientId: user.id } });
    console.log('Notifications eliminadas');
    await prisma.consent.deleteMany({ where: { userId: user.id } });
    console.log('Consents eliminadas');
    await prisma.verification.deleteMany({ where: { identifier: { contains: email.toLowerCase() } } });
    console.log('Verifications eliminadas');
    await prisma.user.delete({ where: { id: user.id } });
    console.log('Usuario eliminado');
    console.log('Limpieza completada para:', email);
  } catch(e) { console.error('Error:', e.message); } finally { await prisma.$disconnect(); }
})();
