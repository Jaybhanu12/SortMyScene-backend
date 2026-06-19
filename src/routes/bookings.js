const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { bookingValidators, validate } = require('../middleware/validators');

// All booking routes require authentication
router.post(
  '/',
  authenticate,
  bookingValidators.confirm,
  validate,
  bookingController.confirmBooking
);

router.get('/my', authenticate, bookingController.getMyBookings);

module.exports = router;
