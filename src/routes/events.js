const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Public routes — no auth required to browse events
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.get('/:id/unavailable-seats', eventController.getUnavailableSeats);
module.exports = router;
