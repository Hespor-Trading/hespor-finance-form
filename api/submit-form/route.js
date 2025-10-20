// Force Node runtime (Nodemailer won't work on the Edge runtime)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import nodemailer from "nodemailer";

function json(res, status = 200) {
  return new Response(JSON.stringify(res), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

export async function POST(req) {
  try {
    // Accept both JSON and <form> posts
    const ct = req.headers.get("content-type") || "";
    let body = {};
    if (ct.includes("application/json")) {
      body = await req.json();
    } else {
      const fd = await req.formData();
      fd.forEach((v, k) => (body[k] = v));
    }

    const {
      fullName = "",
      email = "",
      company = "",
      annualRevenue = "",
      whatsapp = "",
      notes = "",
    } = body;

    if (!fullName || !email) {
      return json({ error: "Missing name or email" }, 400);
    }

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,              // e.g. smtp.gmail.com
      port: Number(process.env.SMTP_PORT || 465), // 465 (SSL) or 587 (STARTTLS)
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465
      auth: {
        user: process.env.SMTP_USER,            // MUST be the mailbox that’s allowed to send
        pass: process.env.SMTP_PASS,            // App Password if Gmail/Workspace + 2FA
      },
    });

    // Verify SMTP before sending (great for debugging)
    try {
      await transporter.verify();
    } catch (e) {
      console.error("SMTP verify failed:", e);
      return json({ error: "SMTP verify failed", detail: String(e?.message || e) }, 500);
    }

    const html = `
      <h2>New Finance Lead</h2>
      <p><b>Name:</b> ${fullName}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Company:</b> ${company}</p>
      <p><b>Annual Revenue (USD):</b> ${annualRevenue}</p>
      <p><b>WhatsApp:</b> ${whatsapp}</p>
      <p><b>Notes:</b><br>${(notes || "").toString().replace(/\n/g, "<br>")}</p>
      <hr>
      <small>Sent from finance.hespor.com</small>
    `;

    // Important: 'from' should be the same domain/mailbox as SMTP_USER to pass DMARC
    const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: process.env.TO_EMAIL,          // e.g. info@hespor.com
      replyTo: email,                    // lead's email for easy reply
      subject: `New HESPOR Finance Lead — ${fullName}`,
      html,
      text: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    });

    console.log("Mail sent:", info.messageId);
    return json({ ok: true });
  } catch (err) {
    console.error("Email send failed:", err);
    return json({ error: "Email failed", detail: String(err?.message || err) }, 500);
  }
}
