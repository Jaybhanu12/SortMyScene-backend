require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Seat = require('../models/Seat');
const User = require('../models/User');

const connectDB = require('../config/database');

const seed = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting seed...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({ email: 'demo@sortmyscene.com' }),
    ]);
    console.log('Cleared existing events and seats');

    await User.create({
      name: 'Demo User',
      email: 'demo@sortmyscene.com',
      password: 'demo123456',
    });
    console.log('Created demo user: demo@sortmyscene.com / demo123456');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
