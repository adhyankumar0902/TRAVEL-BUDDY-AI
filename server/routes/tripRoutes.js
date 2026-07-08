const express = require('express');
const router = express.Router();
const {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

// Mount routes with protect middleware
router.route('/')
  .post(protect, createTrip)
  .get(protect, getMyTrips);

router.route('/:id')
  .get(protect, getTripById)
  .put(protect, updateTrip)
  .delete(protect, deleteTrip);

module.exports = router;
