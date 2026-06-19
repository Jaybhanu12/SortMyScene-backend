// const cron = require('node-cron');
// const Reservation = require('../models/Reservation');

// const startReservationCleanupJob = () => {
//   cron.schedule('* * * * *', async () => {
//     try {
//       const expiredReservations = await Reservation.find({
//         status: 'active',
//         expiresAt: { $lte: new Date() },
//       });

//       if (expiredReservations.length === 0) return;

//       const seatNumbers = expiredReservations.flatMap((r) => r.seatNumbers);

//       // Release seats back to available
//       await Seat.updateMany(
//         { _id: { $in: seatNumbers }, status: 'reserved' },
//         { $set: { status: 'available', reservedBy: null } }
//       );

//       // Mark reservations as expired
//       await Reservation.updateMany(
//         { _id: { $in: expiredReservations.map((r) => r._id) } },
//         { $set: { status: 'expired' } }
//       );

//       console.log(`Cleaned up ${expiredReservations.length} expired reservation(s)`);
//     } catch (err) {
//       console.error('Reservation cleanup job error:', err.message);
//     }
//   });

//   console.log('Reservation cleanup cron job started (runs every minute)');
// };

// module.exports = { startReservationCleanupJob };



const cron = require('node-cron');
const Reservation = require('../models/Reservation');

const startReservationCleanupJob = () => {
  // Runs every single minute ('* * * * *')
  cron.schedule('* * * * *', async () => {
    try {
      const result = await Reservation.updateMany(
        {
          status: 'active',
          expiresAt: { $lte: new Date() },
        },
        { 
          $set: { status: 'expired' } 
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`Cleaned up ${result.modifiedCount} expired reservation(s). Seats are now available!`);
      }
    } catch (err) {
      console.error('Reservation cleanup job error:', err.message);
    }
  });

  console.log('⏱️ Reservation cleanup cron job started (runs every minute)');
};

module.exports = { startReservationCleanupJob };