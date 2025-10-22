import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // ✅ allow both local & production origins
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { fullName, email, company, annualRevenue, whatsapp, notes } = body || {};

    if (!fullName || !email || !company || !annualRevenue) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // ✅ Gmail SMTP setup
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: process.env.TO_EMAIL || "info@hespor.com",
      subject: `New Application from ${fullName}`,
      text: `
Name: ${fullName}
Email: ${email}
Company: ${company}
Annual Revenue: ${annualRevenue}
WhatsApp: ${whatsapp || "-"}
Notes: ${notes || "-"}
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ success: false, message: "Email send failed" });
  }
}
