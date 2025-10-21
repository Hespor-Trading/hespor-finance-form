// api/submit-form.js
import nodemailer from 'nodemailer';

const ALLOW_ORIGINS = [
  'https://finance.hespor.com',
  'https://hespor-finance-form.vercel.app',
  'http://localhost:3000',
];

function setCors(res, origin) {
  if (ALLOW_ORIGINS.includes(origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS,GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readJson(req) {
  const chunks = [];
  await new Promise((resolve, reject) => {
    req.on('data', c => chunks.push(c));
    req.on('end', resolve);
    req.on('error', reject);
  });
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    return {};
  }
}

function cleanRevenue(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const num = Number(v.replace(/[^\d.]/g, ''));
    return Number.isFinite(num) ? num : 0;
  }
  return 0;
}

export default async function handler(req, res) {
  setCors(res, req.headers.origin);

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, message: 'submit-form alive' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const body = await readJson(req);
  const fullName = (body.fullName || body.name || '').toString().trim();
  const email = (body.email || '').toString().trim();
  const company = (body.company || '').toString().trim();
  const annualRevenue = cleanRevenue(body.annualRevenue ?? body.revenue);
  const whatsapp = (body.whatsapp || '').toString().trim();
  const notes = (body.notes || body.message || '').toString().trim();

  if (!fullName || !email || !company) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // Build transporter (Gmail with App Password)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // smtp.gmail.com
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,   // info@hespor.com
      pass: process.env.SMTP_PASS,   // 16-char app password (no spaces)
    },
  });

  const to = process.env.TO_EMAIL || process.env.SMTP_USER;
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

  const html = `
    <h2>New Finance Lead</h2>
    <p><b>Name:</b> ${fullName}</p>
    <p><b>Email:</b> ${email}</p>
    <p><b>Company:</b> ${company}</p>
    <p><b>Annual Revenue (USD):</b> ${annualRevenue || '—'}</p>
    <p><b>WhatsApp:</b> ${whatsapp || '—'}</p>
    <p><b>Notes:</b> ${notes || '—'}</p>
  `;

  try {
    await transporter.sendMail({
      from: `"Hespor Finance Forms" <${from}>`,
      to,
      subject: `New application from ${fullName}`,
      html,
      replyTo: email,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).json({ success: false, message: 'Email send failed' });
  }
}
