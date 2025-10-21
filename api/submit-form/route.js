// app/api/submit-form/route.js
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic"; // ensure it runs on every request

function pick(obj, keys) {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null && String(obj[k]).trim() !== "") {
      return obj[k];
    }
  }
  return undefined;
}

export async function POST(req) {
  try {
    // ---- Parse body safely (JSON or form-encoded) ----
    const ct = req.headers.get("content-type") || "";
    let body = {};
    if (ct.includes("application/json")) {
      body = await req.json();
    } else {
      const raw = await req.text();
      try {
        body = JSON.parse(raw);
      } catch {
        body = Object.fromEntries(new URLSearchParams(raw));
      }
    }

    // ---- Normalize incoming fields (accept many variants) ----
    const name = pick(body, ["fullName", "fullname", "full_name", "name"]);
    const email = pick(body, ["email", "from", "contactEmail"]);
    const company = pick(body, ["company", "companyName", "company_name"]);
    const annualRevenueRaw = pick(body, [
      "annualRevenue",
      "annual_revenue",
      "revenue",
      "Annual Revenue (USD)"
    ]);
    const annualRevenue = annualRevenueRaw !== undefined ? Number(String(annualRevenueRaw).replace(/[^\d.]/g, "")) : undefined;
    const whatsapp = pick(body, ["whatsapp", "whatsappNumber", "phone", "phoneNumber"]);
    const notes = pick(body, ["notes", "message", "additionalInfo", "Additional Info (optional)"]);

    // ---- Minimal required fields: name + email + company ----
    const missing = [];
    if (!name) missing.push("name");
    if (!email) missing.push("email");
    if (!company) missing.push("company");
    if (missing.length) {
      return Response.json(
        { success: false, message: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // ---- Mail transport (uses your Vercel envs) ----
    const host = process.env.SMTP_HOST;        // e.g. smtp.gmail.com
    const port = Number(process.env.SMTP_PORT || 465);
    const user = process.env.SMTP_USER;        // e.g. info@hespor.com
    const pass = process.env.SMTP_PASS;        // Gmail App Password
    const to = process.env.TO_EMAIL || user;   // e.g. info@hespor.com
    const from = process.env.FROM_EMAIL || user;

    if (!host || !port || !user || !pass || !to || !from) {
      return Response.json(
        { success: false, message: "Server email config is incomplete" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587
      auth: { user, pass },
    });

    const subject = `New Finance Lead: ${company} (${name})`;
    const html = `
      <h2>New Finance Lead</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Annual Revenue:</strong> ${annualRevenue ?? "—"}</p>
      <p><strong>WhatsApp / Phone:</strong> ${whatsapp ?? "—"}</p>
      <p><strong>Notes:</strong><br>${(notes ?? "").toString().replace(/\n/g, "<br>")}</p>
    `;

    await transporter.sendMail({ from, to, subject, html });

    return Response.json({ success: true });
  } catch (err) {
    console.error("submit-form error:", err);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// Optional: reject other methods cleanly
export async function GET() {
  return Response.json({ success: false, message: "Method not allowed" }, { status: 405 });
}
