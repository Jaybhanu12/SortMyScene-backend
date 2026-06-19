require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust path if needed
const connectDB = require('../config/database');

const createAdmin = async () => {
  await connectDB();
  
  const adminExists = await User.findOne({ email: 'admin@sortmyscene.com' });
  if (adminExists) {
    console.log('⚠️ Admin user already exists!');
    process.exit(0);
  }

  // Create the Admin (Password will be automatically hashed by your pre-save hook)
  await User.create({
    name: 'Super Admin',
    email: 'admin@sortmyscene.com',
    password: 'SecureAdminPassword123!', 
    role: 'admin'
  });

  console.log('Admin user created successfully.');
  process.exit(0);
};

createAdmin();