const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { register, login, getMe, googleAuth } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 failed requests per windowMs
  message: { message: "Too many failed login attempts, this section is locked for 15 minutes." },
  skipSuccessfulRequests: true, // Do not count 200/201/300 responses
  standardHeaders: true, 
  legacyHeaders: false,
});

// ─── Validation Rules ─────────────────────────────────────────

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// ─── Routes ───────────────────────────────────────────────────

// POST /api/auth/register
router.post("/register", registerValidation, register);

// POST /api/auth/google
router.post("/google", googleAuth);

// POST /api/auth/login
const { validationResult } = require("express-validator");

router.post(
  "/login",
  loginLimiter,
  loginValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  login,
);
// GET /api/auth/me  (protected)
router.get("/me", protect, getMe);

module.exports = router;
