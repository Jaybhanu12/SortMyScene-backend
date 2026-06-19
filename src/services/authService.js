const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // The fix!
const User = require('../models/User');
const Blacklist = require('../models/Blacklist');
const { AppError } = require('../middleware/errorHandler');
const sendEmail = require('../utils/sendEmail');
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' }); // Short life
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); // Long life
};

// 1. Generate and send OTP statelessly
const sendOtp = async (email) => {
  // CRITICAL FIX: Sanitize the email to prevent hash mismatches!
  const cleanEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 2 * 60 * 1000;

  // Hash using the CLEAN email
  const dataToHash = `${cleanEmail}.${otp}.${expiresAt}`;
  const hash = crypto.createHmac('sha256', process.env.JWT_SECRET).update(dataToHash).digest('hex');

  await sendEmail({
    email: cleanEmail,
    subject: 'Your Verification Code',
    message: `Your SortMyScene code is ${otp}. It expires in exactly 2 minutes.`
  });

  return { hash, expiresAt };
};

// 2. Verify hash and save user
const register = async ({ name, email, password, otp, hash, expiresAt }) => {
  // Guard: Ensure frontend sent the security tokens
  if (!hash || !expiresAt) {
    throw new AppError('Missing security token. Please refresh and request a new OTP.', 400);
  }

  if (Date.now() > Number(expiresAt)) {
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp).trim();

  const dataToHash = `${cleanEmail}.${cleanOtp}.${expiresAt}`;
  const calculatedHash = crypto.createHmac('sha256', process.env.JWT_SECRET).update(dataToHash).digest('hex');

  if (calculatedHash !== hash) {
    throw new AppError('Invalid OTP. Please try again.', 400);
  }

  // Safe in-memory user creation
  const user = new User({ name: name.trim(), email: cleanEmail, password });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role || 'user' },
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

// NEW: Refresh Token Logic
const refreshAuthToken = async (oldRefreshToken) => {
  if (!oldRefreshToken) throw new AppError('Refresh token is required', 401);

  // Verify the old token
  const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  
  // Ensure the token exists in the DB for this user
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== oldRefreshToken) {
    throw new AppError('Invalid refresh token', 403);
  }

  // Generate new pair
  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  // Update DB with new refresh token
  user.refreshToken = newRefreshToken;
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const logout = async (userId, accessToken) => {
  await Blacklist.create({ token: accessToken });

  await User.findByIdAndUpdate(userId, { refreshToken: null });

  return { message: 'Logged out successfully' };
};

module.exports = { sendOtp,register, login, refreshAuthToken, logout };