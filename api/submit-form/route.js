// api/submit-form/route.js
export const runtime = 'nodejs'; // Nodemailer requires Node runtime

import nodemailer from 'nodemailer';

// Allow Canva + Vercel origins
const ALLOW_ORIGINS = [
  'https://finance.hespor.com',
  'https://www.hespor-finance-form.vercel.app',
  'https://hespor-finance-form.vercel.app',
  'http://localhost:3000',
];

function cors(resp, req) {
  const origin = req.headers.get('origin') || '';
  if (ALLOW_ORIGINS.includes(origin)) {
    resp.headers.set('Access-Control-Allow-Origin', origin);
  }
  resp.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  resp.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return resp;
}

export async function OPTIONS(req) {
  return cors(new Response(null, { status: 204 }), req);
}

export async function GET(req) {
  // health check
  return cors(
    new Response(JSON.stringify({ ok: true, message: 'submit-form alive' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
    req
  );
}

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return cors(
        new Response(JSON.stringify({ success: false, message: 'Invalid JSON' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
        req
      );
    }

    // Accept multiple key names from different forms
    const fullName =
      body.fullName || body.fullname || body.name || body['full-name'] || '';
    const email = body.email || body.mail || '';
    const company =
      body.company || body.companyName || body['company-name'] || '';
    const annualRevenue =
      typeof body.annualRevenue === 'number'
        ? body.annualRevenue
        : parseFloat(String(body.revenue || body.annual_revenue || '').replace(/[^0-9.]/g, '')) || undefined;
    const whatsapp = body.whatsapp || body.phone || body.whatsappNumber || '';
    const notes = body.notes || body.message || body.additionalInfo || '';

    if (!fullName || !email || !company) {
      return cors(
        new Response(JSON.stringify({ success: false, message: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
        req
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: true, // 465 = SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // optional: verify SMTP
    await transporter.verify();

    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
    const toEmail = process.env.TO_EMAIL || process.env.SMTP_USER;

    const subject = `New Finance Lead: ${fullName} • ${company}`;
    const lines = [
      `Full Name: ${fullName}`,
      `Email: ${email}`,
      `Company: ${company}`,
      `Annual Revenue (USD): ${annualRevenue ?? '—'}`,
      `WhatsApp: ${whatsapp || '—'}`,
      `Notes: ${notes || '—'}`,
    ];
    const text = lines.join('\n');
    const html =
      `<h2>New Finance Lead</h2>` +
      `<ul>` +
      lines
        .map((l) => {
          const [k, ...rest] = l.split(': ');
          return `<li><strong>${k}:</strong> ${rest.join(': ')}</li>`;
        })
        .join('') +
      `</ul>`;

    await transporter.sendMail({
      from: `"HESPOR Finance" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject,
      text,
      html,
    });

    return cors(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
      req
    );
  } catch (err) {
    // Surface precise error in logs
    console.error('submit-form error:', err);
    return cors(
      new Response(
        JSON.stringify({
          success: false,
          message: 'Server error',
          detail: (err && err.message) || String(err),
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      ),
      req
    );
  }
}
