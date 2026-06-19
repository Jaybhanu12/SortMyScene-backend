const Reservation = require('../models/Reservation');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { AppError } = require('../middleware/errorHandler');

const RESERVATION_EXPIRY_MINUTES = parseInt(process.env.RESERVATION_EXPIRY_MINUTES) || 10;


const createReservation = async ({ userId, eventId, requestedSeats }) => {
  // requestedSeats should be an array of strings like: ["A1", "A2"]
  if (!requestedSeats || requestedSeats.length === 0) {
    throw new AppError('No seats provided for reservation.', 400);
  }
  if (!Array.isArray(requestedSeats) || requestedSeats.length === 0) {
    throw new AppError('Invalid seat selection.', 400);
  }

  const event = await Event.findOne({ _id: eventId, isActive: true });
  if (!event) {
    throw new AppError('Event not found or no longer active.', 404);
  }

  const conflictingReservation = await Reservation.findOne({
    eventId,
    status: 'active',
    seatNumbers: { $in: requestedSeats }, // If ANY match, it blocks
    expiresAt: { $gt: new Date() },
  });

  const conflictingBooking = await Booking.findOne({
    eventId,
    status: 'confirmed',
    seatNumbers: { $in: requestedSeats }, // If ANY match, it blocks
  });

  if (conflictingReservation || conflictingBooking) {
    throw new AppError(
      'One or more selected seats were just taken. Please refresh and try again.',
      409
    );
  }

 
  await Reservation.updateMany(
    {
      userId,
      eventId,
      status: 'active',
      expiresAt: { $gt: new Date() },
    },
    {
      $set: { status: 'cancelled' },
    }
  );

  // 4. Create the new reservation record
  const expiresAt = new Date(Date.now() + RESERVATION_EXPIRY_MINUTES * 60 * 1000);
  const totalAmount = requestedSeats.length * event.pricePerSeat;

  const reservation = await Reservation.create({
    userId,
    eventId,
    seatNumbers: requestedSeats,
    status: 'active',
    expiresAt,
    totalAmount,
  });

  return {
    reservation: {
      id: reservation._id,
      seatNumbers: requestedSeats,
      expiresAt,
      totalAmount,
      expiresInSeconds: RESERVATION_EXPIRY_MINUTES * 60,
    },
  };
};

const getActiveReservation = async ({ userId, eventId }) => {
  const reservation = await Reservation.findOne({
    userId,
    eventId,
    status: 'active',
    expiresAt: { $gt: new Date() },
  });
  return reservation;
};

module.exports = { createReservation, getActiveReservation };