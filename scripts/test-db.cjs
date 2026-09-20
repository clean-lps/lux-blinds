require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaNeonHttp } = require('@prisma/adapter-neon');

const url = process.env.DATABASE_URL;
const adapter = new PrismaNeonHttp(url, { fullResults: true });
const db = new PrismaClient({ adapter });

db.user.findMany({ take: 3 })
  .then(r => { console.log('Users found:', r.length); r.forEach(u => console.log(' -', u.email)); return db.$disconnect(); })
  .catch(e => { console.error('Error:', e.message); return db.$disconnect(); });
