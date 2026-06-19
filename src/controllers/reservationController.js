const reservationService = require('../services/reservationService');
const Reservation = require('../models/Reservation');
const createReservation = async (req, res, next) => {
  // console.log('Received Reservation Request Body:', req.body);

  try {
    const { eventId, requestedSeats } = req.body;

    // Add a check to catch missing data immediately
    if (!eventId || !requestedSeats) {
        return res.status(400).json({ 
            success: false, 
            message: `Missing required fields. Received: eventId=${eventId}, requestedSeats=${requestedSeats}` 
        });
    }

    const result = await reservationService.createReservation({
      userId: req.user._id,
      eventId,
      requestedSeats,
    });
    
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const cancelReservation = async (req, res, next) => {
  try {
    const { reservationId } = req.body;
    
    // Find the active reservation and update it to cancelled
    const updatedReservation = await Reservation.findOneAndUpdate(
      { _id: reservationId, userId: req.user._id, status: 'active' },
      { $set: { status: 'cancelled' } },
      { new: true }
    );

    // If no reservation matched the query details, return a 404 cleanly instead of failing silently
    if (!updatedReservation) {
      return res.status(404).json({
        success: false,
        message: 'Active reservation not found, already cancelled, or unauthorized.'
      });
    }

    res.status(200).json({ success: true, message: 'Reservation cancelled successfully', data: updatedReservation });
  } catch (error) {
    next(error);
  }
};

const getActiveReservation = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    const reservation = await Reservation.findOne({
      userId: req.user._id,
      eventId: eventId,
      status: 'active',
      expiresAt: { $gt: new Date() } // Must not be expired
    });

    res.status(200).json({ success: true, data: { reservation } });
  } catch (error) {
    next(error);
  }
};
module.exports = { createReservation, getActiveReservation, cancelReservation };