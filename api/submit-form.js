// api/submit-form.js
import nodemailer from 'nodemailer';

const ALLOW_ORIGINS = [
  'https://finance.hespor.com',
  'https://hespor-finance-form.vercel.app',
  'https://www.hespor-finance-form.vercel.app',
  'http://localhost:3000'
];

function setCors(res, origin) {
  if (ALLOW_ORIGINS.includes(origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readJson(req) {
  // Manually read the body (works reliably on Vercel Node functions)
  const chunks = [];
  return await new Promise((resolve, reject) => {
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString() || '{}';
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
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

  // ---- Read & normalize body ----
  let body = {};
  try {
    if ((req.headers['content-type'] || '').includes('application/json')) {
      body = await readJson(req);
    } else {
      // Fallback if body already parsed
      body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    }
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid JSON' });
  }

  const fullName = body.fullName || body.fullname || body.name || body['full-name'] || '';
  const email = body.email || body.mail || '';
  const company = body.company || body.companyName || body['company-name'] || '';
  const annualRevenue =
    typeof body.annualRevenue === 'number'
      ? body.annualRevenue
      : parseFloat(String(body.revenue || body.annual_revenue || '').replace(/[^0-9.]/g, '')) || undefined;
  const whatsapp = body.whatsapp || body.phone || body.whatsappNumber || '';
  const notes = body.notes || body.message || body.additionalInfo || '';

  if (!fullName || !email || !company) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
      got: { fullName: !!fullName, email: !!email, company: !!company }
    });
  }

  // ---- SMTP ----
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,                 // smtp.gmail.com
      port: Number(process.env.SMTP_PORT || 465),  // 465
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    await transporter.verify();

    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
    const toEmail = process.env.TO_EMAIL || process.env.SMTP_USER;

    await transporter.sendMail({
      from: `"HESPOR Finance" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: `New Finance Lead: ${fullName} • ${company}`,
      text:
        `Full Name: ${fullName}\n` +
        `Email: ${email}\n` +
        `Company: ${company}\n` +
        `Annual Revenue (USD): ${annualRevenue ?? '—'}\n` +
        `WhatsApp: ${whatsapp || '—'}\n` +
        `Notes: ${notes || '—'}\n`
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ success: false, message: 'Email send failed', detail: err.message });
  }
}

// Disable Next.js bodyParser if this runs inside Next (harmless on Vercel Node)
export const config = { api: { bodyParser: false } };
