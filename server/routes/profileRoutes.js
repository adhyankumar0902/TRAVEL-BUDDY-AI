const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getPublicProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// Route to get logged-in user's profile
router.get('/', protect, getProfile);

// Route to update logged-in user's profile
router.put('/', protect, updateProfile);

// Route to view another user's public profile
router.get('/:id', protect, getPublicProfile);

module.exports = router;
