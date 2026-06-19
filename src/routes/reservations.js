const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticate } = require('../middleware/auth');
const { reservationValidators, validate } = require('../middleware/validators');

// All reservation routes require authentication
router.post(
  '/',
  authenticate,
  reservationValidators.create,
  validate,
  reservationController.createReservation
);
router.post('/cancel', authenticate, reservationController.cancelReservation);
router.get('/active/:eventId', authenticate, reservationController.getActiveReservation);

module.exports = router;
