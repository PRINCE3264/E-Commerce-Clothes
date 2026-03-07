const express = require('express');
const router = express.Router();
const { createContact, getContacts, updateContactStatus, deleteContact } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(createContact)
    .get(protect, authorize('admin'), getContacts);

router.route('/:id')
    .put(protect, authorize('admin'), updateContactStatus)
    .delete(protect, authorize('admin'), deleteContact);

module.exports = router;
