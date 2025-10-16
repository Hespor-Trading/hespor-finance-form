import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    company, country, founded, website, businessType,
    avgImport, revenue, chinaSuppliers, email, whatsapp, message
  } = req.body;

  // Eligibility check
  if (Number(revenue) < 500000) {
    return res.status(200).json({
      success: false,
      message: "Unfortunately, based on your annual revenue, you are not eligible for 90–120 day payment terms.",
    });
  }

  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.TO_EMAIL) {
      throw new Error("Missing SMTP credentials in environment variables");
    }

    // Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Compose email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.TO_EMAIL,
      subject: "New Hespor Finance Lead Form Submission",
      html: `
        <h2>New Submission</h2>
        <p><b>Company:</b> ${company}</p>
        <p><b>Country:</b> ${country}</p>
        <p><b>Founded:</b> ${founded}</p>
        <p><b>Website:</b> ${website}</p>
        <p><b>Business Type:</b> ${businessType}</p>
        <p><b>Avg Import Volume:</b> $${avgImport}</p>
        <p><b>Revenue:</b> $${revenue}</p>
        <p><b>China Suppliers:</b> ${chinaSuppliers}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>WhatsApp:</b> ${whatsapp}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email sending failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
