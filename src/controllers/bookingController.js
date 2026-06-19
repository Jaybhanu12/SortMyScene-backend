const bookingService = require('../services/bookingService');

const confirmBooking = async (req, res, next) => {
  try {
    const { reservationId } = req.body;
    const booking = await bookingService.confirmBooking({
      userId: req.user._id,
      reservationId,
    });
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getMyBookings(req.user._id);
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

module.exports = { confirmBooking, getMyBookings };
