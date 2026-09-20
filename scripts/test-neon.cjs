require('dotenv/config');
const { neon } = require('@neondatabase/serverless');

const url = process.env.DATABASE_URL;
console.log('Full URL:', url);

const sql = neon(url);
sql.query('SELECT 1 as ok')
  .then(r => { console.log('Result:', JSON.stringify(r)); })
  .catch(e => { console.error('Error:', e.message, e.cause?.message || ''); });
