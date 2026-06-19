const eventService = require('../services/eventService');
const Reservation = require('../models/Reservation');
const Booking = require('../models/Booking');

const getAllEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

const getUnavailableSeats = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;

    const activeReservations = await Reservation.find({
      eventId,
      status: 'active',
      expiresAt: { $gt: new Date() }
    }).select('seatNumbers');

    const confirmedBookings = await Booking.find({
      eventId,
      status: 'confirmed'
    }).select('seatNumbers');

    const reserved = activeReservations.flatMap(r => r.seatNumbers);
    const booked = confirmedBookings.flatMap(b => b.seatNumbers);

    res.status(200).json({ 
      success: true, 
      data: { reserved, booked } 
    });
  } catch (error) {
    next(error);
  }
};




module.exports = { getAllEvents, getEventById, getUnavailableSeats };