import nodemailer from "nodemailer";

const ALLOW_ORIGINS = [
  "https://hespor-finance-form.vercel.app",
  "https://finance.hespor.com",
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

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")
    return res.status(405).json({ success: false, message: "Method not allowed" });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

  const fullName = body.fullName ?? "";
  const email = body.email ?? "";
  const company = body.company ?? "";
  const annualRevenue = Number(body.annualRevenue ?? 0);
  const whatsapp = body.whatsapp ?? "";
  const notes = body.notes ?? "";

  if (!fullName || !email || !company || !annualRevenue)
    return res.status(400).json({ success: false, message: "Missing required fields" });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const to = process.env.TO_EMAIL || "info@hespor.com";
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `New Finance Application from ${fullName}`,
      text: [
        `Name: ${fullName}`,
        `Email: ${email}`,
        `Company: ${company}`,
        `Annual Revenue (USD): ${annualRevenue}`,
        `WhatsApp: ${whatsapp || "-"}`,
        `Notes: ${notes || "-"}`,
      ].join("\n"),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Email send failed" });
  }
}
