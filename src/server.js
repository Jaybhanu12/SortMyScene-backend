require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { startReservationCleanupJob } = require('./utils/cleanupJob');

// Route imports
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const reservationRoutes = require('./routes/reservations');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin'); 

const app = express();
app.set('trust proxy', 1);
connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'https://sortmyscene-frontend.onrender.com',
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Routes 
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reserve', reservationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes); 

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'SortMyScene API is running ' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler 
app.use(errorHandler);

//  Start Server 
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  startReservationCleanupJob();
});

// Graceful shutdown
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});


process.on('uncaughtException', (error) => {
  console.error('🚨 Caught Uncaught Exception at boundary loop:', error.stack || error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Intercepted Unhandled Rejection at boundary loop:', reason);
});


process.on('SIGTERM', () => {
  server.close(() => console.log('Process terminated'));
});



module.exports = app;
