const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes and verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header: "Bearer <token>" -> split by space and take the second part
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature and expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB based on ID stored in token payload, omit password field
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Move to next middleware or route handler
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token was found
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
