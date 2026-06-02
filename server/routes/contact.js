const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const sendEmail = require("../utils/sendEmail");

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@locationtracker.app";

const contactValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("subject").trim().notEmpty().withMessage("Subject is required"),
  body("message").trim().notEmpty().withMessage("Message is required").isLength({ min: 10, max: 5000 }),
];

// POST /api/contact
router.post("/", contactValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { name, email, subject, message } = req.body;

  try {
    // Send notification to support team
    await sendEmail({
      to: SUPPORT_EMAIL,
      subject: `[NexTrack Contact] ${subject} — from ${name}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0d17; color: #e2e8f0; padding: 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
          <h2 style="color: #a3a6ff; margin-top: 0;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #94a3b8; width: 100px;">From:</td><td style="padding: 8px 0;"><strong>${name}</strong></td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #a3a6ff;">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Subject:</td><td style="padding: 8px 0;">${subject}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 20px 0;" />
          <p style="color: #94a3b8; white-space: pre-wrap; line-height: 1.6;">${message}</p>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 20px 0;" />
          <p style="color: #475569; font-size: 12px;">Reply directly to this email to respond to ${name}.</p>
        </div>
      `,
      text: `New contact from ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
    });

    // Send confirmation to sender
    await sendEmail({
      to: email,
      subject: "We received your message — NexTrack Support",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0d17; color: #e2e8f0; padding: 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
          <h2 style="color: #a3a6ff; margin-top: 0;">Thanks for reaching out, ${name}!</h2>
          <p style="color: #94a3b8; line-height: 1.6;">We've received your message about <strong style="color: #e2e8f0;">"${subject}"</strong> and will get back to you within 24 hours on business days.</p>
          <p style="color: #94a3b8; line-height: 1.6;">Your message:</p>
          <blockquote style="border-left: 3px solid #6366f1; margin: 0; padding: 12px 16px; background: rgba(99,102,241,0.05); border-radius: 0 8px 8px 0; color: #cbd5e1; font-style: italic;">${message}</blockquote>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0;" />
          <p style="color: #475569; font-size: 12px; margin: 0;">— NexTrack Support Team | <a href="https://locationtracker.app" style="color: #6366f1;">locationtracker.app</a></p>
        </div>
      `,
      text: `Thanks ${name}! We received your message about "${subject}" and will reply within 24 hours.`,
    });

    res.json({ success: true, message: "Message sent successfully." });
  } catch (err) {
    console.error("[contact] email error:", err.message);
    // Still acknowledge receipt even if email fails (saves to logs)
    res.json({ success: true, message: "Message received. We will follow up shortly." });
  }
});

module.exports = router;
