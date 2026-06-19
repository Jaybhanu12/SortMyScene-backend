const authService = require('../services/authService');
const User = require('../models/User');

const sendOtp = async (req, res, next) => {
  try {
    const result = await authService.sendOtp(req.body.email);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    // Now includes otp, hash, and expiresAt
    const { name, email, password, otp, hash, expiresAt } = req.body; 
    const result = await authService.register({ name, email, password, otp, hash, expiresAt });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'User is already verified' });
    if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    },
  });
};

const refreshToken = async (req, res, next) => {
  try {
    // Assuming the frontend sends the refresh token in the body
    const { refreshToken } = req.body; 
    
    const result = await authService.refreshAuthToken(refreshToken);
    
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // The authenticate middleware gives us the user ID
    const userId = req.user._id;
    
    const authHeader = req.headers.authorization;
    const accessToken = authHeader.split(' ')[1];

    const result = await authService.logout(userId, accessToken);
    
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, sendOtp, login, getMe, refreshToken, logout };