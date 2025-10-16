// api/submit.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const data = req.body || {};
    // Basic required fields check
    const required = ['company_name', 'year_established', 'avg_monthly_import', 'annual_revenue', 'china_suppliers', 'email'];
    for (const f of required) {
      if (!data[f]) return res.status(400).send(`Missing field: ${f}`);
    }

    // Build email content
    const subject = `New HESPOR Finance lead: ${data.company_name}`;
    const html = `
      <h2>New Eligibility Submission</h2>
      <table border="0" cellpadding="6" cellspacing="0">
        <tr><td><b>Company Name</b></td><td>${escapeHtml(data.company_name)}</td></tr>
        <tr><td><b>Registered Country</b></td><td>${escapeHtml(data.company_country || '')}</td></tr>
        <tr><td><b>Year Established</b></td><td>${escapeHtml(data.year_established)}</td></tr>
        <tr><td><b>Website</b></td><td>${escapeHtml(data.company_website || '')}</td></tr>
        <tr><td><b>Business Type</b></td><td>${escapeHtml(data.business_type || '')}</td></tr>
        <tr><td><b>Avg Monthly Import (USD)</b></td><td>${escapeHtml(data.avg_monthly_import)}</td></tr>
        <tr><td><b>Annual Revenue (USD)</b></td><td>${escapeHtml(data.annual_revenue)}</td></tr>
        <tr><td><b>China suppliers?</b></td><td>${escapeHtml(data.china_suppliers)}</td></tr>
        <tr><td><b>Email</b></td><td>${escapeHtml(data.email)}</td></tr>
        <tr><td><b>WhatsApp</b></td><td>${escapeHtml(data.whatsapp || '')}</td></tr>
        <tr><td><b>Message</b></td><td>${escapeHtml(data.message || '')}</td></tr>
      </table>
    `;

    // SMTP transporter from env vars
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: process.env.TO_EMAIL || 'info@hespor.com',
      subject,
      html,
      replyTo: data.email
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
}

// small sanitizer
function escapeHtml(s='') {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
