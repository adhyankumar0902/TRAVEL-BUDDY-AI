const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token will be valid for 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic validation of input fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // 2. Check if user already exists in database
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 3. Create the user (password hashing is handled in User.js schema pre-save hook)
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      // 4. Respond with user details and generated JWT token
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate credentials inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 2. Check user by email
    const user = await User.findOne({ email });

    // 3. If user exists and password is correct (checked via model helper method)
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      // Respond with a generic error message for security reasons
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private (Requires JWT token check via protect middleware)
const me = async (req, res) => {
  try {
    // req.user has already been set by the authMiddleware 'protect'
    res.json(req.user);
  } catch (error) {
    console.error('Fetch Current User Error:', error);
    res.status(500).json({ message: 'Server error retrieving user data' });
  }
};

module.exports = {
  signup,
  login,
  me
};
