// api/submit-form.js
import nodemailer from 'nodemailer';

const ALLOW_ORIGINS = [
  'https://finance.hespor.com',
  'https://hespor-finance-form.vercel.app',
  'http://localhost:3000'
];

function setCors(res, origin) {
  if (ALLOW_ORIGINS.includes(origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8') || '{}';
  try { return JSON.parse(raw); } catch { return {}; }
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  setCors(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  const body = await readJson(req);

  // Expect these keys from the frontend
  const {
    fullName,
    email,
    company,
    annualRevenue,   // number or string is OK; we normalise
    whatsapp = '',
    notes = ''
  } = body || {};

  if (!fullName || !email || !company || !annualRevenue) {
    res.status(400).json({ success: false, message: 'Missing required fields' });
    return;
  }

  // Build transporter from env
  const {
    SMTP_HOST = 'smtp.gmail.com',
    SMTP_PORT = '465',
    SMTP_USER,
    SMTP_PASS,
    FROM_EMAIL,
    TO_EMAIL
  } = process.env;

  if (!SMTP_USER || !SMTP_PASS || !FROM_EMAIL || !TO_EMAIL) {
    res.status(500).json({ success: false, message: 'Email is not configured' });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: true, // 465
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  // Email content
  const html = `
    <h2>New Financing Lead</h2>
    <p><b>Full Name:</b> ${fullName}</p>
    <p><b>Email:</b> ${email}</p>
    <p><b>Company:</b> ${company}</p>
    <p><b>Annual Revenue (USD):</b> ${annualRevenue}</p>
    ${whatsapp ? `<p><b>WhatsApp:</b> ${whatsapp}</p>` : ''}
    ${notes ? `<p><b>Notes:</b> ${notes}</p>` : ''}
  `;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,         // MUST equal your Gmail/Google Workspace mailbox
      to: TO_EMAIL,             // where you receive leads
      replyTo: email,           // replies go to the lead
      subject: 'HESPOR Finance – New Lead',
      html
    });

    // success payload
    res.status(200).json({ success: true });
  } catch (err) {
    // surface smtp errors to logs & caller
    console.error('SMTP ERROR:', err?.message || err);
    res.status(502).json({ success: false, message: 'Email send failed' });
  }
}
