const { body, param, validationResult,check } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const authValidators = {
  register: [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name too long'),
    body('email').trim().isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  login: [
    body('email').trim().isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
};

const reservationValidators = {
  create: [
    check('eventId').isMongoId().withMessage('Invalid Event ID'),
    check('requestedSeats') 
      .isArray({ min: 1 })
      .withMessage('At least one seat must be selected')
      .custom((value) => {
        // Ensure every seat is a valid format (e.g., A1, B10)
        if (!value.every(seat => typeof seat === 'string')) {
          throw new Error('All seats must be strings');
        }
        return true;
      }),
  ],
};

const bookingValidators = {
  confirm: [
    body('reservationId').isMongoId().withMessage('Invalid reservation ID'),
  ],
};

module.exports = {
  validate,
  authValidators,
  reservationValidators,
  bookingValidators,
};
