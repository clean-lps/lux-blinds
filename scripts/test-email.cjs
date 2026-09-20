require('dotenv/config');
const { Resend } = require('resend');

const key = process.env.RESEND_API_KEY;
console.log('Key:', key ? key.substring(0, 8) + '...' : 'MISSING');

const resend = new Resend(key);
resend.emails.send({
  from: 'LUX Blinds <onboarding@resend.dev>',
  to: ['danolight007@gmail.com'],
  subject: 'Test from LUX Blinds',
  html: '<p>Resend is connected. Your verification codes will arrive here.</p>'
}).then(r => {
  console.log('Sent! ID:', r.data?.id);
  if (r.error) console.error('Error:', r.error);
}).catch(e => console.error('Failed:', e.message));
