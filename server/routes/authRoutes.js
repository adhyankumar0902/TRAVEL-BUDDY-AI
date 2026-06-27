const express = require('express');
const router = express.Router();
const { signup, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Route for User Registration (Signup)
router.post('/signup', signup);

// Route for User Authentication (Login)
router.post('/login', login);

// Route to get Current User profile (Protected)
router.get('/me', protect, me);

module.exports = router;
