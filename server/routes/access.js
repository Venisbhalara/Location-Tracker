const express = require('express');
const router = express.Router();
const { AccessRequest } = require('../models/index');
const { protect } = require('../middleware/auth');
const logActivity = require('../utils/activityLogger');

// ── Helper: sanitize a free-text string ────────────────────────────────────────
function sanitizeText(str, maxLen = 1000) {
  if (!str || typeof str !== 'string') return '';
  // Strip HTML tags and control characters, trim whitespace
  return str
    .replace(/<[^>]*>/g, '')      // strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
    .trim()
    .slice(0, maxLen);
}

// POST /api/access/request
router.post('/request', protect, async (req, res) => {
  try {
    // ── Guard: DB connection check ────────────────────────────────────────────
    // (Sequelize throws if DB is unreachable; caught below)

    // ── Guard: already has access ─────────────────────────────────────────────
    if (req.user.trackingAccess) {
      return res.status(400).json({
        success: false,
        message: 'You already have tracking access. No need to request again.',
      });
    }

    // ── Guard: already has a pending request ──────────────────────────────────
    const existing = await AccessRequest.findOne({
      where: { userId: req.user.id, status: 'pending' },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending access request. Please wait for admin review.',
        requestId: existing.id,
        submittedAt: existing.createdAt,
      });
    }

    // ── Sanitize & validate reason ────────────────────────────────────────────
    const reason = sanitizeText(req.body.reason);
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for your access request.',
      });
    }

    // ── Create the request ────────────────────────────────────────────────────
    const newRequest = await AccessRequest.create({
      userId: req.user.id,
      reason,
      status: 'pending',
    });

    // ── Log to admin activity feed ────────────────────────────────────────────
    try {
      await logActivity(req.app.get('io'), {
        type: 'pending_access',
        label: 'Access Request',
        detail1: req.user.email,
        detail2: 'Pending Review',
        color: 'border-[#F59E0B]',
        userId: req.user.id,
      });
    } catch (logErr) {
      // Non-fatal — don't fail the request if logging fails
      console.warn('[access/request] Activity log failed:', logErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Access request submitted successfully. You will be notified once reviewed.',
      request: {
        id: newRequest.id,
        status: newRequest.status,
        submittedAt: newRequest.createdAt,
      },
    });
  } catch (error) {
    console.error('[access/request] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while submitting your request. Please try again later.',
      ...(process.env.NODE_ENV !== 'production' && { debug: error.message }),
    });
  }
});

// GET /api/access/status
router.get('/status', protect, async (req, res) => {
  try {
    const latestRequest = await AccessRequest.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      success: true,
      trackingAccess: req.user.trackingAccess,
      accessStatus: req.user.accessStatus,
      latestRequest: latestRequest
        ? {
            id: latestRequest.id,
            status: latestRequest.status,
            reason: latestRequest.reason,
            rejectionReason: latestRequest.rejectionReason,
            submittedAt: latestRequest.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error('[access/status] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching access status.',
      ...(process.env.NODE_ENV !== 'production' && { debug: error.message }),
    });
  }
});

module.exports = router;
