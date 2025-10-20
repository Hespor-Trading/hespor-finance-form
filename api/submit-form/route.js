// api/submit-form/route.js
import nodemailer from "nodemailer";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req) {
  try {
    const data = await req.json().catch(() => null);
    if (!data) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders() } }
      );
    }

    // Accept multiple possible keys for each field
    const fullName =
      data.fullName ?? data.fullname ?? data["full-name"] ?? data.name ?? data.FullName;
    const email =
      data.email ?? data.Email ?? data["emailAddress"] ?? data["email_address"];
    const company =
      data.company ?? data.companyName ?? data["company_name"] ?? data.Company;
    const annualRevenueRaw =
      data.annualRevenue ?? data["annual_revenue"] ?? data.revenue ?? data.Revenue;
    const whatsapp =
      data.whatsapp ?? data.whatsApp ?? data.phone ?? data.phoneNumber ?? "";
    const notes =
      data.notes ?? data.message ?? data["additionalInfo"] ?? data["additional_info"] ?? "";

    // Normalize / validate revenue (allow number or string like "$500k")
    const annualRevenue =
      typeof annualRevenueRaw === "number"
        ? annualRevenueRaw
        : String(annualRevenueRaw || "").trim();

    const missing = [];
    if (!fullName) missing.push("fullName");
    if (!email) missing.push("email");
    if (!company) missing.push("company");
    if (!annualRevenue) missing.push("annualRevenue");

    if (missing.length) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Missing required fields: ${missing.join(", ")}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders() } }
      );
    }

    // --- Nodemailer transport (uses your Vercel env vars) ---
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.FROM_EMAIL || user;
    const to = process.env.TO_EMAIL;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const subject = `New Finance Lead — ${fullName} (${company})`;
    const html = `
      <h2>New Lead Submission</h2>
      <ul>
        <li><strong>Name:</strong> ${fullName}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Company:</strong> ${company}</li>
        <li><strong>Annual Revenue:</strong> ${annualRevenue}</li>
        <li><strong>WhatsApp/Phone:</strong> ${whatsapp || "-"}</li>
      </ul>
      <p><strong>Notes:</strong><br>${(notes || "-")
        .toString()
        .replace(/\n/g, "<br>")}</p>
    `;
    const text =
      `New Lead Submission\n\n` +
      `Name: ${fullName}\n` +
      `Email: ${email}\n` +
      `Company: ${company}\n` +
      `Annual Revenue: ${annualRevenue}\n` +
      `WhatsApp/Phone: ${whatsapp || "-"}\n\n` +
      `Notes:\n${notes || "-"}`;

    await transporter.sendMail({ from, to, subject, text, html });

    return new Response(
      JSON.stringify({ success: true, message: "Email sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders() } }
    );
  } catch (err) {
    console.error("submit-form error:", err);
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders() } }
    );
  }
}
