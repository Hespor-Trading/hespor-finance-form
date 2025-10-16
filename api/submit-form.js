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

  // Step 1: Eligibility check
  if (Number(revenue) < 500000) {
    return res.status(200).json({
      success: false,
      message:
        "Unfortunately, based on your annual revenue, you are not eligible for 90–120 day payment terms.",
    });
  }

  try {
    // Step 2: Validate ENV variables
    if (
      !process.env.FROM_EMAIL ||
      !process.env.APP_PASSWORD ||
      !process.env.TO_EMAIL
    ) {
      throw new Error("Missing email credentials in environment variables");
    }

    // Step 3: Setup Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

    // Step 4: Compose email
    const mailOptions = {
      from: process.env.FROM_EMAIL,
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

    // Step 5: Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email sending failed:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
