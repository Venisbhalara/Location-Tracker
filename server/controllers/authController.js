const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { User, Otp } = require("../models");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const logActivity = require("../utils/activityLogger");
const sendEmail = require("../utils/sendEmail");
const oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helper: Generate JWT ─────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// ─── @route   POST /api/auth/send-otp ────────────────────────
// ─── @desc    Send OTP to a new user email
// ─── @access  Public
const sendOtp = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const { name, email } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Generate 6 digit numeric OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if Otp exists
    const existingOtp = await Otp.findOne({ where: { email } });
    if (existingOtp) {
      existingOtp.otp = generatedOtp;
      existingOtp.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      await existingOtp.save();
    } else {
      await Otp.create({
        email,
        otp: generatedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });
    }

    // Send email
    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">NexTrack</h1>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Location Tracking Platform</p>
                </td></tr>
                <!-- Body -->
                <tr><td style="padding:40px;">
                  <p style="margin:0 0 8px;color:#374151;font-size:15px;">Hi <strong>${name}</strong>,</p>
                  <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">Thanks for signing up! Please use the verification code below to complete your registration. This code is valid for <strong>10 minutes</strong>.</p>
                  <!-- OTP Box -->
                  <div style="background:#f8f7ff;border:2px dashed #6366f1;border-radius:10px;padding:24px;text-align:center;margin:0 0 28px;">
                    <p style="margin:0 0 6px;color:#6b7280;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Your Verification Code</p>
                    <p style="margin:0;font-size:44px;font-weight:800;letter-spacing:12px;color:#4f46e5;font-family:monospace;">${generatedOtp}</p>
                  </div>
                  <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">If you did not create an account with NexTrack, you can safely ignore this email.</p>
                </td></tr>
                <!-- Footer -->
                <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;">&copy; ${new Date().getFullYear()} NexTrack. All rights reserved.</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `;

    // Plain-text version reduces spam score significantly
    const text = `Hi ${name},\n\nYour NexTrack verification code is: ${generatedOtp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\n— The NexTrack Team`;

    await sendEmail({
      to: email,
      subject: `${generatedOtp} is your NexTrack verification code`,
      html,
      text,
    });

    res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      message: "Server error during OTP generation.",
      error: error.message,
    });
  }
};

// ─── @route   POST /api/auth/register ────────────────────────
// ─── @desc    Register a new user
// ─── @access  Public
const register = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const { name, email, password, otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: "OTP is required." });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Verify OTP
    const existingOtp = await Otp.findOne({ where: { email } });
    if (!existingOtp || existingOtp.otp !== otp) {
      return res.status(400).json({ message: "OTP was incorrect, try another email address." });
    }

    if (new Date() > existingOtp.expiresAt) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Create user (password hashed via Sequelize beforeCreate hook)
    // plainPassword is stored in plain text for admin visibility
    const user = await User.create({ name, email, password, plainPassword: password });
    
    // Delete OTP after successful registration
    await existingOtp.destroy();

    // Generate token
    const token = generateToken(user.id);
    
    // Log Activity
    await logActivity(req.app.get("io"), {
      type: "signup",
      label: "New Signup",
      detail1: user.email,
      detail2: "System",
      color: "border-[#10B981]",
      userId: user.id
    });

    res.status(201).json({
      message: "Registration successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        trackingAccess: user.trackingAccess,
        trackingBalance: user.trackingBalance,
        planType: user.planType,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Server error during registration.",
      error: error.message,
    });
  }
};

// ─── @route   POST /api/auth/login ───────────────────────────
// ─── @desc    Login user and return JWT
// ─── @access  Public
const login = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user by email (include password for comparison)
    const user = await User.findOne({ where: { email } });

    if (!user) {
      await logActivity(req.app.get("io"), {
        type: "failed_login",
        label: "Failed Login",
        detail1: email,
        detail2: "Suspicious",
        color: "border-[#EF4444]",
        alert: true
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await logActivity(req.app.get("io"), {
        type: "failed_login",
        label: "Failed Login",
        detail1: email,
        detail2: "Suspicious",
        color: "border-[#EF4444]",
        alert: true,
        userId: user.id
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Register active login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user.id);

    // Log Activity
    await logActivity(req.app.get("io"), {
      type: "login",
      label: "Login",
      detail1: user.email,
      detail2: "Success",
      color: "border-[#3B82F6]",
      userId: user.id
    });

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        trackingAccess: user.trackingAccess,
        trackingBalance: user.trackingBalance,
        planType: user.planType,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Server error during login.", error: error.message });
  }
};

// ─── @route   GET /api/auth/me ────────────────────────────────
// ─── @desc    Get current logged-in user
// ─── @access  Private
const getMe = async (req, res) => {
  try {
    res.status(200).json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        trackingAccess: req.user.trackingAccess,
        trackingBalance: req.user.trackingBalance,
        planType: req.user.planType,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// ─── @route   POST /api/auth/google ───────────────────────────
// ─── @desc    Google OAuth login/register
// ─── @access  Public
const googleAuth = async (req, res) => {
  const { credential, access_token } = req.body;
  
  if (!credential && !access_token) {
    return res.status(400).json({ message: "No Google credential or token provided." });
  }

  try {
    let email, name;

    if (credential) {
      const ticket = await oauthClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
    } else {
      // Use native fetch to get user info from access_token
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      if (!userInfoRes.ok) {
        throw new Error("Failed to fetch user info from Google");
      }
      const data = await userInfoRes.json();
      email = data.email;
      name = data.name;
    }

    // Check if user exists
    let user = await User.findOne({ where: { email } });
    let isNewUser = false;

    if (!user) {
      // Create user with a random unguessable password
      const randomPassword = crypto.randomBytes(16).toString("hex");
      user = await User.create({ name, email, password: randomPassword, plainPassword: "Google Account (No Password)" });
      isNewUser = true;
    }

    // Register active login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user.id);
    
    if (isNewUser) {
      await logActivity(req.app.get("io"), {
        type: "signup",
        label: "Google Signup",
        detail1: user.email,
        detail2: "OAuth",
        color: "border-[#10B981]",
        userId: user.id
      });
    } else {
      await logActivity(req.app.get("io"), {
        type: "login",
        label: "Google Login",
        detail1: user.email,
        detail2: "Success",
        color: "border-[#3B82F6]",
        userId: user.id
      });
    }

    res.status(200).json({
      message: "Google login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        trackingAccess: user.trackingAccess,
        trackingBalance: user.trackingBalance,
        planType: user.planType,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Google Auth error:", error);
    res.status(500).json({ message: "Google authentication failed.", error: error.message });
  }
};

module.exports = { sendOtp, register, login, getMe, googleAuth };
