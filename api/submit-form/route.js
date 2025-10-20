export async function GET() {
  try {
    // Quick SMTP ping
    const nodemailer = (await import("nodemailer")).default;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.verify(); // throws if auth/port wrong

    return new Response(
      JSON.stringify({
        ok: true,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        userEndsWith: (process.env.SMTP_USER || "").split("@").pop(),
        fromEndsWith: (process.env.FROM_EMAIL || process.env.SMTP_USER || "")
          .split("@")
          .pop(),
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e?.message || e) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
