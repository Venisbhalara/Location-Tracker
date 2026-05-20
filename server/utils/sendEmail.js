const nodemailer = require('nodemailer');

/**
 * sendEmail — dual-mode email utility
 *
 * Priority:
 *  1. Resend API  (RESEND_API_KEY set)  → works on Render/Vercel/any host
 *  2. SMTP        (SMTP_HOST + SMTP_USER + SMTP_PASS set) → works on localhost
 *  3. Mock        (nothing configured)  → logs to console only
 *
 * WHY: Render free tier blocks outbound SMTP (ports 25, 465, 587).
 *      Resend uses HTTPS so it is never blocked.
 */

// ─── SMTP singleton (localhost / VPS only) ────────────────────────────────
let _smtpTransporter = null;

const getSmtpTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  if (!_smtpTransporter) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const isSecurePort = port === 465;

    _smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: isSecurePort,
      requireTLS: !isSecurePort,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    });

    _smtpTransporter.verify((err) => {
      if (err) {
        console.error('❌ SMTP transporter verification failed:', err.message);
        _smtpTransporter = null;
      } else {
        console.log('✅ SMTP transporter ready');
      }
    });
  }
  return _smtpTransporter;
};

// ─── Resend API sender (production / Render) ───────────────────────────────
const sendViaResend = async (options) => {
  const apiKey   = process.env.RESEND_API_KEY;
  const fromName  = process.env.FROM_NAME  || 'NexTrack';
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev'; // default resend sandbox

  const body = {
    from:    `${fromName} <${fromEmail}>`,
    to:      [options.to],
    subject: options.subject,
    html:    options.html,
    text:    options.text,
  };

  const response = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Resend API error ${response.status}: ${JSON.stringify(data)}`);
  }

  console.log(`✅ Email sent via Resend to ${options.to} | id: ${data.id}`);
  return data;
};

// ─── SMTP sender (localhost / VPS) ─────────────────────────────────────────
const sendViaSmtp = async (options) => {
  const transporter = getSmtpTransporter();
  if (!transporter) return null; // signals "not available"

  const fromName  = process.env.FROM_NAME  || 'NexTrack';
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

  const message = {
    from:    `"${fromName}" <${fromEmail}>`,
    to:      options.to,
    subject: options.subject,
    html:    options.html,
    text:    options.text,
    headers: {
      'X-Priority': '1',
      'X-Mailer':   'NexTrack Mailer',
      'Reply-To':   fromEmail,
    },
  };

  try {
    const info = await transporter.sendMail(message);
    console.log(`✅ Email sent via SMTP to ${options.to} | msgId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ SMTP send failed for ${options.to}:`, err.message);
    _smtpTransporter = null; // reset pool on error
    throw err;
  }
};

// ─── Public API ────────────────────────────────────────────────────────────
const sendEmail = async (options) => {
  // 1. Resend API (production — works on Render, Vercel, Railway, etc.)
  if (process.env.RESEND_API_KEY) {
    return sendViaResend(options);
  }

  // 2. SMTP (localhost / VPS with open SMTP ports)
  const smtpResult = await sendViaSmtp(options);
  if (smtpResult !== null) return smtpResult;

  // 3. Mock (development fallback — no credentials configured)
  console.log('\n================ EMAIL MOCK ================');
  console.log(`To: ${options.to}\nSubject: ${options.subject}`);
  console.log(`Body:\n${options.text || options.html || ''}`);
  console.log('============================================\n');
  return { mocked: true };
};

module.exports = sendEmail;
