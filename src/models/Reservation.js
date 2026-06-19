const mongoose = require('mongoose');

const RESERVATION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

const reservationSchema = new mongoose.Schema(
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
      index: true,
    },
    // INDUSTRY STANDARD: Store seat identifiers as simple strings, no external Seat documents needed
    seatNumbers: [
      {
        type: String,
        required: true
      },
    ],
    status: {
      type: String,
      enum: Object.values(RESERVATION_STATUS),
      default: RESERVATION_STATUS.ACTIVE,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: MongoDB will automatically remove expired reservation docs after expiry
// This is the ONLY place expiresAt should be indexed to avoid duplicate warnings
reservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

reservationSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

module.exports = mongoose.model('Reservation', reservationSchema);
module.exports.RESERVATION_STATUS = RESERVATION_STATUS;