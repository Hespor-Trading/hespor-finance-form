// api/submit-form/route.js
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Accept many common aliases from frontends/Canva/etc.
function normalize(raw = {}) {
  const get = (...keys) => {
    for (const k of keys) {
      if (raw[k] !== undefined && raw[k] !== "") return raw[k];
    }
    return undefined;
  };

  const fullName = get("fullName", "full_name", "name");
  const email = get("email", "Email", "eMail");
  const company = get("company", "Company", "companyName", "company_name");
  const annualRevenue = get(
    "annualRevenue",
    "annual_revenue",
    "revenue",
    "Annual Revenue (USD)"
  );
  const whatsapp = get("whatsapp", "phone", "phoneNumber", "whatsApp");
  const notes = get("notes", "message", "Additional Info", "additionalInfo");

  return {
    fullName,
    email,
    company,
    annualRevenue:
      annualRevenue !== undefined && annualRevenue !== ""
        ? Number(String(annualRevenue).replace(/[^\d.]/g, ""))
        : undefined,
    whatsapp,
    notes,
  };
}

// Parse JSON or form-data safely
async function readBody(req) {
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) return await req.json();
    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      return Object.fromEntries(fd.entries());
    }
  } catch {}
  return {};
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST(req) {
  const raw = await readBody(req);
  const data = normalize(raw);

  const missing = ["fullName", "email", "company", "annualRevenue"].filter(
    (k) => !data[k] && data[k] !== 0
  );
  if (missing.length) {
    return NextResponse.json(
      { success: false, message: `Missing required fields: ${missing.join(", ")}`, received: raw },
      { status: 400, headers: cors }
    );
  }

  // SMTP transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,                  // smtp.gmail.com
    port: Number(process.env.SMTP_PORT || 465),   // 465
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: {
      user: process.env.SMTP_USER,                // info@hespor.com
      pass: process.env.SMTP_PASS,                // Gmail App Password
    },
  });

  const subject = `New Finance Application — ${data.fullName} (${data.company})`;
  const text = [
    `Name: ${data.fullName}`,
    `Email: ${data.email}`,
    `Company: ${data.company}`,
    `Annual Revenue: ${data.annualRevenue}`,
    `WhatsApp: ${data.whatsapp || "-"}`,
    `Notes: ${data.notes || "-"}`,
  ].join("\n");

  const html = `
    <h2>New Finance Application</h2>
    <p><b>Name:</b> ${data.fullName}</p>
    <p><b>Email:</b> ${data.email}</p>
    <p><b>Company:</b> ${data.company}</p>
    <p><b>Annual Revenue:</b> ${data.annualRevenue}</p>
    <p><b>WhatsApp:</b> ${data.whatsapp || "-"}</p>
    <p><b>Notes:</b><br>${(data.notes || "").replace(/\n/g, "<br>")}</p>
  `;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to: process.env.TO_EMAIL || process.env.SMTP_USER,
    subject,
    text,
    html,
    replyTo: data.email,
  });

  return NextResponse.json({ success: true }, { headers: cors });
}

// For any other method:
export default function handler() {
  return NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405, headers: cors });
}
