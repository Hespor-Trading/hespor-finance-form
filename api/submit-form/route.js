// api/submit-form/route.js
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

// Make sure this runs on Node (not Edge), required for nodemailer
export const runtime = "nodejs";

export async function POST(req) {
  try {
    // ---- read JSON safely
    let data = null;
    try {
      data = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // ---- accept multiple key variants from your form/console tests
    const name =
      data.name || data.fullName || data.full_name || data.fullname;
    const email = data.email;
    const company = data.company || data.companyName || data.company_name;
    const revenue =
      data.revenue || data.annualRevenue || data.annual_revenue;
    const whatsapp =
      data.whatsapp ||
      data.whatsApp ||
      data.whatsappNumber ||
      data.phone ||
      data.phoneNumber;
    const message =
      data.message || data.notes || data.additionalInfo || data.additional_info;

    // ---- basic validation
    if (!name || !email || !company || !revenue) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // ---- mail transport (uses your Vercel env vars)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // smtp.gmail.com
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: {
        user: process.env.SMTP_USER, // info@hespor.com
        pass: process.env.SMTP_PASS, // 16-char Google App Password (no spaces)
      },
    });

    const to = (process.env.TO_EMAIL || process.env.SMTP_USER).split(",");
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

    const subject = `New Hespor Finance Application — ${name}`;
    const html = `
      <h2>New Application</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Company:</b> ${company}</p>
      <p><b>Annual Revenue (USD):</b> ${revenue}</p>
      ${whatsapp ? `<p><b>WhatsApp:</b> ${whatsapp}</p>` : ""}
      ${message ? `<p><b>Message:</b> ${message}</p>` : ""}
      <hr>
      <small>Sent from hespor-finance-form</small>
    `;

    await transporter.sendMail({ from, to, subject, html });

    return NextResponse.json({ success: true, message: "Email sent" });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// Optional: tell other methods they’re not allowed
export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}
