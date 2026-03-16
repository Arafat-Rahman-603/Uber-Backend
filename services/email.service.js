import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Validate email environment variables at startup
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error(
    "⚠️  WARNING: EMAIL_USER or EMAIL_PASS environment variables are not set!",
    "\n  EMAIL_USER:", process.env.EMAIL_USER ? "✓ set" : "✗ MISSING",
    "\n  EMAIL_PASS:", process.env.EMAIL_PASS ? "✓ set" : "✗ MISSING",
    "\n  Emails will NOT be sent until these are configured."
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (email, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "Email service is not configured. EMAIL_USER and EMAIL_PASS environment variables are required."
    );
  }

  const mailOptions = {
    from: `"Uber Clone" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
        <h2 style="text-align: center; color: #111; margin-bottom: 8px;">Verify Your Email</h2>
        <p style="text-align: center; color: #555; font-size: 14px;">Use the code below to complete your registration.</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #111; color: #fff; padding: 16px 32px; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        <p style="text-align: center; color: #999; font-size: 12px;">This code expires in 5 minutes. Do not share it with anyone.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to:", email, "MessageId:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Failed to send email to:", email);
    console.error("  Error:", error.message);
    console.error("  Code:", error.code);
    throw error;
  }
};
