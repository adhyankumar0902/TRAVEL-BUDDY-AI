const express = require('express');
const router = express.Router();
const { getPublicTrips, getPublicTripById } = require('../controllers/publicTripController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getPublicTrips);

router.route('/:id')
  .get(protect, getPublicTripById);

module.exports = router;
