import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, company, annualRevenue, message } = body;

    // Reject if revenue is below $500,000
    if (Number(annualRevenue) < 500000) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Not eligible: revenue below $500,000 USD.",
        }),
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    await transporter.sendMail({
      from: `"Hespor Finance" <${process.env.SMTP_USER}>`,
      to: "info@hespor.com",
      subject: "New Financing Inquiry",
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nAnnual Revenue: ${annualRevenue}\nMessage: ${message}`,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
