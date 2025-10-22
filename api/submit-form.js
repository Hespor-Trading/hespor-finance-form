import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // CORS for Vercel function (form can be opened anywhere)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // Expecting these fields from the client
    const fullName = body?.name?.toString().trim();
    const email = body?.email?.toString().trim();
    const company = body?.company?.toString().trim();
    const annualRevenue = body?.annualRevenue?.toString().trim();
    const whatsapp = body?.whatsapp?.toString().trim() || "";
    const notes = body?.notes?.toString().trim() || "";

    if (!fullName || !email || !company || !annualRevenue) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Env configuration (matches your Vercel screenshots)
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      FROM_EMAIL,
      TO_EMAIL,
    } = process.env;

    // Nodemailer (Gmail SMTP over SSL 465)
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST || "smtp.gmail.com",
      port: Number(SMTP_PORT || 465),
      secure: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    // Build email body
    const subject = `New Finance Application: ${fullName}`;
    const text = [
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Company: ${company}`,
      `Annual Revenue: ${annualRevenue}`,
      `WhatsApp: ${whatsapp || "-"}`,
      `Notes: ${notes || "-"}`,
    ].join("\n");

    await transporter.sendMail({
      from: FROM_EMAIL || SMTP_USER,
      to: TO_EMAIL || "info@hespor.com",
      subject,
      text,
    });

    // Success → client will redirect
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return res.status(500).json({ success: false, message: "Email send failed" });
  }
}
