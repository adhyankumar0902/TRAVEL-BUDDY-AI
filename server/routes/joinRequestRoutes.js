const express = require('express');
const router = express.Router();
const {
  createJoinRequest,
  getJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  deleteJoinRequest
} = require('../controllers/joinRequestController');
const { protect } = require('../middleware/authMiddleware');

// Mount routes with protect middleware
router.route('/')
  .post(protect, createJoinRequest)
  .get(protect, getJoinRequests);

router.route('/:id/accept')
  .put(protect, acceptJoinRequest);

router.route('/:id/reject')
  .put(protect, rejectJoinRequest);

router.route('/:id')
  .delete(protect, deleteJoinRequest);

module.exports = router;
