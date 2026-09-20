const { neon } = require('@neondatabase/serverless');

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required (see .env.example)');
const sql = neon(url);

async function query(sqlStr) {
  try {
    await sql(sqlStr);
  } catch (err) {
    console.error('ERROR:', err.message);
    throw err;
  }
}

async function main() {
  console.log('Starting Neon seed...');

  const bcrypt = await import('bcrypt');
  const adminPass = await bcrypt.hash('demo12345678', 10);
  const clientPass = await bcrypt.hash('demo12345678', 10);

  const statements = [
    `INSERT INTO "User" ("id","name","email","emailVerified","role") VALUES ('00000000-0000-4000-8000-000000000010','Admin User','admin@luxblinds.demo',true,'admin');`,
    `INSERT INTO "User" ("id","name","email","emailVerified","role") VALUES ('00000000-0000-4000-8000-000000000020','Client User','client@luxblinds.demo',true,'client');`,
    `INSERT INTO "Organization" ("id","companyName","contactName","phone","address","taxStatus","revision") VALUES ('00000000-0000-4000-8000-000000000001','Lux Blinds Demo','Demo Contact','+1 555 0100','123 Demo Ave, Miami FL','approved',1);`,
    `INSERT INTO "Membership" ("id","userId","organizationId") VALUES ('00000000-0000-4000-8000-000000000040','00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001');`,
    `INSERT INTO "Membership" ("id","userId","organizationId") VALUES ('00000000-0000-4000-8000-000000000041','00000000-0000-4000-8000-000000000020','00000000-0000-4000-8000-000000000001');`,
    `INSERT INTO "Account" ("id","accountId","providerId","userId","password") VALUES ('00000000-0000-4000-8000-000000000030','00000000-0000-4000-8000-000000000020','credential','00000000-0000-4000-8000-000000000020','${adminPass}');`,
    `INSERT INTO "Account" ("id","accountId","providerId","userId","password") VALUES ('00000000-0000-4000-8000-000000000031','00000000-0000-4000-8000-000000000010','credential','00000000-0000-4000-8000-000000000010','${clientPass}');`,
    `INSERT INTO "Order" ("id","number","organizationId","createdBy","sidemark","status","specialNotes","revision","submittedAt") VALUES ('00000000-0000-4000-8000-000000000100','ORD-001','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000020','Ocean Residence Living Room','received','Confirm track finish before production',1,NOW() - INTERVAL '2 days');`,
    `INSERT INTO "Order" ("id","number","organizationId","createdBy","sidemark","status","specialNotes","revision","submittedAt") VALUES ('00000000-0000-4000-8000-000000000110','ORD-002','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000020','Studio West Hall','in_production','',2,NOW() - INTERVAL '1 day');`,
    `INSERT INTO "Order" ("id","number","organizationId","createdBy","sidemark","status","specialNotes","revision","submittedAt") VALUES ('00000000-0000-4000-8000-000000000120','ORD-003','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000020','Garden Suite Master','ready_for_installation','',1,NOW());`,
    `INSERT INTO "OrderItem" ("id","orderId","position","quantity","productType","fabricName","widthEighths","heightEighths","trackSupplied","opening","track","fullness","installation","operation","controlSide","ruleVersion") VALUES ('00000000-0000-4000-8000-000000000200','00000000-0000-4000-8000-000000000100',1,2,'Ripple Fold','Linen Whisper',800,672,true,'C/O','White','100%','Ceiling','Manual','Right','lux-observed-v1');`,
    `INSERT INTO "OrderItem" ("id","orderId","position","quantity","productType","fabricName","widthEighths","heightEighths","trackSupplied","opening","track","fullness","installation","operation","controlSide","ruleVersion") VALUES ('00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000110',1,3,'Roller','Solar Shield',600,560,true,'Window','Black','100%','Wall','Motorized','Left','lux-observed-v1');`,
    `INSERT INTO "OrderItem" ("id","orderId","position","quantity","productType","fabricName","widthEighths","heightEighths","trackSupplied","opening","track","fullness","installation","operation","controlSide","ruleVersion") VALUES ('00000000-0000-4000-8000-000000000202','00000000-0000-4000-8000-000000000120',1,1,'Roman Shades','Silk Luxe',900,720,true,'Arch','Gold','100%','Ceiling','Manual','Right','lux-observed-v1');`,
    `INSERT INTO "Notification" ("id","recipientId","type","title","safeBody","createdAt") VALUES ('00000000-0000-4000-8000-000000000500','00000000-0000-4000-8000-000000000020','order_received','Order Received','Your order ORD-001 has been received and is being reviewed.',NOW() - INTERVAL '2 days');`,
    `INSERT INTO "Notification" ("id","recipientId","type","title","safeBody","createdAt") VALUES ('00000000-0000-4000-8000-000000000501','00000000-0000-4000-8000-000000000020','order_production','In Production','Your order ORD-002 is now in production.',NOW() - INTERVAL '1 day');`,
  ];

  let ok = 0, fail = 0;
  for (let i = 0; i < statements.length; i++) {
    const s = statements[i];
    try {
      await query(s);
      ok++;
    } catch (e) {
      console.error(`FAIL #${i+1}: ${s}`);
      console.error(e.message);
      fail++;
    }
  }
  console.log(`Seed done: ${ok} ok, ${fail} fail out of ${statements.length}`);
}

main().catch(console.error);