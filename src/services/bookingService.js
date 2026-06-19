const mongoose = require('mongoose');
const crypto = require('crypto');
const Reservation = require('../models/Reservation');
const Booking = require('../models/Booking');
const { AppError } = require('../middleware/errorHandler');

const generateBookingReference = () => {
  return 'SMS-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

const confirmBooking = async ({ userId, reservationId }) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Fetch reservation and lock it within the transaction
    const reservation = await Reservation.findOne({
      _id: reservationId,
      userId,
      status: 'active',
    }).session(session);

    if (!reservation) {
      throw new AppError('Reservation not found or does not belong to you.', 404);
    }

    // 2. Check expiry explicitly
    if (reservation.isExpired()) {
      reservation.status = 'expired';
      await reservation.save({ session });
      await session.commitTransaction();
      throw new AppError('Your reservation has expired. Please select seats again.', 410);
    }

    // 3. Mark reservation as confirmed
    reservation.status = 'confirmed';
    await reservation.save({ session });

    // 4. Create booking record
    let bookingReference = generateBookingReference();
    let attempts = 0;
    while (attempts < 3) {
      const exists = await Booking.findOne({ bookingReference }).session(session);
      if (!exists) break;
      bookingReference = generateBookingReference();
      attempts++;
    }

    const [booking] = await Booking.create(
      [{
        userId,
        eventId: reservation.eventId,
        reservationId: reservation._id,
        seatNumbers: reservation.seatNumbers,
        totalAmount: reservation.totalAmount,
        bookingReference,
        status: 'confirmed',
      }],
      { session }
    );

    await session.commitTransaction();

    return {
      bookingReference: booking.bookingReference,
      seatNumbers: booking.seatNumbers,
      totalAmount: booking.totalAmount,
      eventId: booking.eventId,
      createdAt: booking.createdAt,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getMyBookings = async (userId) => {
  return Booking.find({ userId, status: 'confirmed' })
    .populate('eventId', 'name date venue pricePerSeat imageUrl') // Populated visual details
    .sort({ createdAt: -1 })
    .lean();
};

module.exports = { confirmBooking, getMyBookings };