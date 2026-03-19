const express = require('express');
const router = express.Router();
const { AccessRequest, User } = require('../models/index');
const { protect } = require('../middleware/auth');

// POST /api/access/request
router.post('/request', protect, async (req, res) => {
  try {
    // Check if user already has access
    if (req.user.trackingAccess) {
      return res.status(400).json({ message: 'You already have tracking access.' });
    }

    // Check if there is already a pending request
    const existing = await AccessRequest.findOne({
      where: { userId: req.user.id, status: 'pending' }
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request.' });
    }

    const newRequest = await AccessRequest.create({
      userId: req.user.id,
      reason: req.body.reason || '',
      status: 'pending'
    });

    res.status(201).json({ message: 'Request submitted successfully', request: newRequest });
  } catch (error) {
    console.error('Access request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/access/status
router.get('/status', protect, async (req, res) => {
  try {
    const latestRequest = await AccessRequest.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ 
      trackingAccess: req.user.trackingAccess,
      latestRequest: latestRequest || null 
    });
  } catch (error) {
    console.error('Access status error:', error);
    res.status(500).json({ message: 'Server error fetching status' });
  }
});

module.exports = router;
