const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log(`\n================ EMAIL MOCK ================`);
      console.log(`To: ${options.to}\nSubject: ${options.subject}`);
      console.log(`Body:\n${options.html}`);
      console.log(`============================================\n`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = {
      from: `${process.env.FROM_NAME || 'Location Tracker Admin'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(message);
    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};

module.exports = sendEmail;
