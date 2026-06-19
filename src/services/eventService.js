const Event = require('../models/Event');
const Reservation = require('../models/Reservation');
const Booking = require('../models/Booking');
const { AppError } = require('../middleware/errorHandler');

const getAllEvents = async () => {
  const events = await Event.find({ isActive: true }).sort({ date: 1 }).lean();

  // Enrich each event with live seat counts dynamically
  const enriched = await Promise.all(
    events.map(async (event) => {
      // Fetch active reservations and confirmed bookings
      const [activeReservations, confirmedBookings] = await Promise.all([
        Reservation.find({ eventId: event._id, status: 'active', expiresAt: { $gt: new Date() } }),
        Booking.find({ eventId: event._id, status: 'confirmed' })
      ]);

      // Sum up the length of the seatNumbers arrays
      const reserved = activeReservations.reduce((sum, r) => sum + r.seatNumbers.length, 0);
      const booked = confirmedBookings.reduce((sum, b) => sum + b.seatNumbers.length, 0);
      const available = event.totalSeats - reserved - booked;

      return { 
        ...event, 
        seatStats: { total: event.totalSeats, available, reserved, booked } 
      };
    })
  );

  return enriched;
};

const getEventById = async (eventId) => {
  const event = await Event.findOne({ _id: eventId, isActive: true }).lean();
  if (!event) {
    throw new AppError('Event not found.', 404);
  }

  // Fetch active reservations and confirmed bookings
  const [activeReservations, confirmedBookings] = await Promise.all([
    Reservation.find({ eventId: event._id, status: 'active', expiresAt: { $gt: new Date() } }),
    Booking.find({ eventId: event._id, status: 'confirmed' })
  ]);

  const reserved = activeReservations.reduce((sum, r) => sum + r.seatNumbers.length, 0);
  const booked = confirmedBookings.reduce((sum, b) => sum + b.seatNumbers.length, 0);
  const available = event.totalSeats - reserved - booked;

  const seatStats = {
    total: event.totalSeats,
    available,
    reserved,
    booked,
  };

  return { ...event, seatStats }; 
};

module.exports = { getAllEvents, getEventById };