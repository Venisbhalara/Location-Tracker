const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');

// ─── Validation Rules ─────────────────────────────────────────

const createValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Contact name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ min: 7, max: 20 }).withMessage('Phone must be between 7 and 20 characters'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('notes')
    .optional()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
];

const updateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 7, max: 20 }).withMessage('Phone must be between 7 and 20 characters'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('notes')
    .optional()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
];

// ─── Routes (all protected) ───────────────────────────────────

// POST   /api/contacts       — create contact
// GET    /api/contacts       — get all contacts (with ?search= and ?page= ?limit=)
router.route('/')
  .post(protect, createValidation, createContact)
  .get(protect, getContacts);

// GET    /api/contacts/:id   — get one contact
// PUT    /api/contacts/:id   — update contact
// DELETE /api/contacts/:id   — delete contact
router.route('/:id')
  .get(protect, getContactById)
  .put(protect, updateValidation, updateContact)
  .delete(protect, deleteContact);

module.exports = router;
