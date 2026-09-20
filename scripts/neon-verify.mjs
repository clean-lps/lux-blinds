const NEON_URL = process.env.NEON_SQL_URL || 'https://billowing-flower-aml1n57a-pooler.c-5.us-east-1.aws.neon.tech/sql';
const CONN_STR = process.env.DATABASE_URL;
if (!CONN_STR) throw new Error('DATABASE_URL is required (see .env.example)');

async function q(sql) {
  const r = await fetch(NEON_URL, { method:'POST', headers:{'Content-Type':'application/json','neon-connection-string':CONN_STR}, body:JSON.stringify({query:sql}) });
  return r.json();
}

async function main() {
  const tables = await q("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
  console.log('Tables:', tables.rows.map(r=>r.tablename).join(', '));
  const users = await q('SELECT id,name,email,role FROM "User"');
  console.log('Users:', JSON.stringify(users.rows, null, 2));
  const orders = await q('SELECT id,number,status,sidemark FROM "Order"');
  console.log('Orders:', JSON.stringify(orders.rows, null, 2));
  const items = await q('SELECT COUNT(*) as total FROM "OrderItem"');
  console.log('Order items:', items.rows[0].total);
  const notifs = await q('SELECT COUNT(*) as total FROM "Notification"');
  console.log('Notifications:', notifs.rows[0].total);
}
main().catch(console.error);
