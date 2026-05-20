const nodemailer = require('nodemailer');

// ─── Singleton transporter (connection pool) ───────────────────────────────
// Created once when the module loads, reused for every email to avoid
// the overhead of a new TCP + TLS handshake on every request.
let _transporter = null;

const getTransporter = () => {
  // Return null (mock mode) if SMTP is not configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  if (!_transporter) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const isSecurePort = port === 465; // port 465 uses SSL, 587 uses STARTTLS

    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: isSecurePort,          // true for 465, false for 587 (STARTTLS)
      requireTLS: !isSecurePort,     // force STARTTLS upgrade on port 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,   // accept self-signed certs (safe for Gmail)
        minVersion: 'TLSv1.2',
      },
      connectionTimeout: 10000,      // 10s – fail fast instead of hanging
      greetingTimeout: 10000,
      socketTimeout: 15000,
      pool: true,                    // keep connections alive between sends
      maxConnections: 3,
      maxMessages: 100,
    });

    // Verify once so config errors surface at startup, not at send time
    _transporter.verify((err) => {
      if (err) {
        console.error('❌ SMTP transporter verification failed:', err.message);
        _transporter = null; // reset so next call retries with fresh config
      } else {
        console.log('✅ SMTP transporter ready — emails will be delivered');
      }
    });
  }

  return _transporter;
};

// ─── sendEmail ────────────────────────────────────────────────────────────
const sendEmail = async (options) => {
  const transporter = getTransporter();

  // ── Mock mode (no SMTP credentials configured) ─────────────────────────
  if (!transporter) {
    console.log('\n================ EMAIL MOCK ================');
    console.log(`To: ${options.to}\nSubject: ${options.subject}`);
    console.log(`Body:\n${options.html || options.text || ''}`);
    console.log('============================================\n');
    return { mocked: true };
  }

  // ── Real send ──────────────────────────────────────────────────────────
  const fromName  = process.env.FROM_NAME  || 'NexTrack';
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

  const message = {
    from:    `"${fromName}" <${fromEmail}>`,
    to:      options.to,
    subject: options.subject,
    html:    options.html,
    text:    options.text,   // plain-text fallback (reduces spam score)
    // ── Anti-spam / deliverability headers ──────────────────────────────
    headers: {
      'X-Priority': '1',
      'X-Mailer':   'NexTrack Mailer',
      'Reply-To':   fromEmail,
    },
  };

  try {
    const info = await transporter.sendMail(message);
    console.log(`✅ Email sent to ${options.to} | msgId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email to ${options.to} failed:`, error.message);
    // Reset cached transporter so the next call gets a fresh connection
    _transporter = null;
    throw error; // bubble up so the caller can return a proper 500
  }
};

module.exports = sendEmail;
