const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { Contact } = require('../models');

// ─── @route   POST /api/contacts ─────────────────────────────
// ─── @desc    Create a new contact
// ─── @access  Private
const createContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const { name, phone, email, notes } = req.body;

  try {
    const contact = await Contact.create({
      userId: req.user.id,
      name,
      phone,
      email: email || null,
      notes: notes || null,
    });

    res.status(201).json({ message: 'Contact created successfully!', contact });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ message: 'Server error while creating contact.', error: error.message });
  }
};

// ─── @route   GET /api/contacts ──────────────────────────────
// ─── @desc    Get all contacts for logged-in user (with optional search)
// ─── @access  Private
const getContacts = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build dynamic where clause
    const where = { userId: req.user.id };

    if (search && search.trim()) {
      where[Op.or] = [
        { name:  { [Op.like]: `%${search.trim()}%` } },
        { phone: { [Op.like]: `%${search.trim()}%` } },
        { email: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    const { count, rows: contacts } = await Contact.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.status(200).json({
      contacts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error while fetching contacts.', error: error.message });
  }
};

// ─── @route   GET /api/contacts/:id ──────────────────────────
// ─── @desc    Get a single contact by ID
// ─── @access  Private
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found.' });
    }

    res.status(200).json({ contact });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ message: 'Server error while fetching contact.', error: error.message });
  }
};

// ─── @route   PUT /api/contacts/:id ──────────────────────────
// ─── @desc    Update a contact
// ─── @access  Private
const updateContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  try {
    const contact = await Contact.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found.' });
    }

    const { name, phone, email, notes } = req.body;

    await contact.update({
      name:  name  ?? contact.name,
      phone: phone ?? contact.phone,
      email: email !== undefined ? email : contact.email,
      notes: notes !== undefined ? notes : contact.notes,
    });

    res.status(200).json({ message: 'Contact updated successfully!', contact });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ message: 'Server error while updating contact.', error: error.message });
  }
};

// ─── @route   DELETE /api/contacts/:id ───────────────────────
// ─── @desc    Delete a contact
// ─── @access  Private
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found.' });
    }

    await contact.destroy();

    res.status(200).json({ message: 'Contact deleted successfully.' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Server error while deleting contact.', error: error.message });
  }
};

module.exports = { createContact, getContacts, getContactById, updateContact, deleteContact };
