// /api/submit-form.js
import nodemailer from "nodemailer";

const ALLOW_ORIGINS = [
  "https://finance.hespor.com",
  "https://hespor-finance-form.vercel.app",
  "https://www.hespor-finance-form.vercel.app",
  "http://localhost:3000",
];

function setCors(res, origin) {
  if (ALLOW_ORIGINS.includes(origin || "")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res, req.headers.origin);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method Not Allowed" });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const name    = body.fullName || body.name || "";
  const email   = body.email || "";
  const company = body.company || "";
  const revenue = (body.annualRevenue || "").toString();
  const phone   = body.whatsapp || body.phone || "";
  const message = body.notes || body.message || "";

  if (!name || !email || !company || revenue === "") {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,               // e.g. smtp.gmail.com
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465, // true for 465
      auth: {
        user: process.env.SMTP_USER,             // info@hespor.com
        pass: process.env.SMTP_PASS,             // Gmail App Password (no spaces)
      },
    });

    // Verify SMTP before sending to surface config errors quickly
    await transporter.verify();

    await transporter.sendMail({
      from: `"Hespor Finance" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: process.env.TO_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `New Finance Form — ${name} (${company})`,
      html: `
        <h2>New Submission</h2>
        <ul>
          <li><b>Name:</b> ${name}</li>
          <li><b>Email:</b> ${email}</li>
          <li><b>Company:</b> ${company}</li>
          <li><b>Annual Revenue (USD):</b> ${revenue}</li>
          <li><b>WhatsApp/Phone:</b> ${phone}</li>
          <li><b>Notes:</b> ${message}</li>
        </ul>
      `,
    });

    // success → front-end will redirect
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Mail error:", err);
    return res.status(500).json({ success: false, message: "Email send failed" });
  }
}
