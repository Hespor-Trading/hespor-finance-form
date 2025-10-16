import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    company,
    country,
    founded,
    website,
    businessType,
    avgImport,
    revenue,
    chinaSuppliers,
    email,
    whatsapp,
    message,
  } = req.body;

  // Eligibility check
  if (Number(revenue) < 500000) {
    return res.status(200).json({
      success: false,
      message: "Not eligible — revenue below $500k.",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: "New Hespor Finance Form Submission",
      html: `
        <h2>New Submission</h2>
        <p><b>Company:</b> ${company}</p>
        <p><b>Country:</b> ${country}</p>
        <p><b>Year Established:</b> ${founded}</p>
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

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
