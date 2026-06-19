const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
    },
    // INDUSTRY STANDARD: Just an array of strings like ["A1", "A2"]
    seatNumbers: {
      type: [String],
      required: true
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    bookingReference: {
      type: String,
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ bookingReference: 1 });

module.exports = mongoose.model('Booking', bookingSchema);