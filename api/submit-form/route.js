import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    // Get form data (supports both JSON and form submission)
    const contentType = req.headers.get("content-type") || "";
    let data = {};

    if (contentType.includes("application/json")) {
      data = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        data[key] = value;
      });
    }

    const {
      fullName = "",
      email = "",
      company = "",
      annualRevenue = "",
      whatsapp = "",
      notes = "",
    } = data;

    if (!fullName || !email) {
      return new Response(
        JSON.stringify({ error: "Missing name or email" }),
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT) === 465, // true for SSL (465)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const html = `
      <h2>New Finance Lead</h2>
      <p><b>Name:</b> ${fullName}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Company:</b> ${company}</p>
      <p><b>Annual Revenue (USD):</b> ${annualRevenue}</p>
      <p><b>WhatsApp:</b> ${whatsapp}</p>
      <p><b>Notes:</b><br>${notes}</p>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      replyTo: email,
      subject: `New HESPOR Finance Lead — ${fullName}`,
      html,
      text: html.replace(/<[^>]+>/g, " "),
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error("Email send failed:", error);
    return new Response(
      JSON.stringify({ error: "Email failed" }),
      { status: 500 }
    );
  }
}
