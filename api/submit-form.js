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

async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8") || "{}";
  try { return JSON.parse(raw); } catch { return {}; }
}

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  setCors(res, origin);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const body = await readJson(req);

  // Accept both old and new field names
  const name    = body.fullName || body.name || "";
  const email   = body.email || "";
  const company = body.company || body.companyName || "";
  const revenue =
    body.annualRevenue ?? body.revenue ?? ""; // may be string or number
  const phone   = body.whatsapp || body.phone || "";
  const message = body.notes || body.message || "";

  if (!name || !email || !company || revenue === "") {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,             // smtp.gmail.com
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465, // true for 465
      auth: {
        user: process.env.SMTP_USER,           // info@hespor.com
        pass: process.env.SMTP_PASS,           // 16-char App Password (no spaces)
      },
    });

    const TO = process.env.TO_EMAIL || "info@hespor.com";
    const FROM = process.env.FROM_EMAIL || process.env.SMTP_USER;

    await transporter.sendMail({
      from: `HESPOR Finance <${FROM}>`,
      to: TO,
      subject: `New Application: ${name} (${company})`,
      text:
`Name: ${name}
Email: ${email}
Company: ${company}
Annual Revenue (USD): ${revenue}
WhatsApp/Phone: ${phone}
Notes: ${message}`,
      html: `
        <h2>New Finance Application</h2>
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

    // success for front-end (it will redirect)
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Mail error:", err);
    return res.status(500).json({ success: false, message: "Email send failed" });
  }
}
