const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      maxlength: [100, 'Event name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    venue: {
      name: { type: String, required: [true, 'Venue name is required'], trim: true },
      city: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    //  Dynamic Layout
    layout: {
      rows: { 
        type: [String], 
        required: [true, 'Row configuration is required'] 
      },
      seatsPerRow: { 
        type: Number, 
        required: [true, 'Seats per row is required'],
        min: [1, 'Must have at least 1 seat per row']
      }
    },
    totalSeats: {
      type: Number,
      min: [1, 'Total seats must be at least 1'],
      max: [50000, 'Total seats cannot exceed 50000'],
    },
    pricePerSeat: {
      type: Number,
      required: [true, 'Price per seat is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      enum: ['concert', 'sports', 'theater', 'conference', 'other'],
      default: 'other',
    },
    imageUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-calculate total capacity before validation runs
eventSchema.pre('validate', function (next) {
  if (this.layout && this.layout.rows && this.layout.seatsPerRow) {
    this.totalSeats = this.layout.rows.length * this.layout.seatsPerRow;
  }
  next();
});

eventSchema.index({ date: 1, isActive: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);