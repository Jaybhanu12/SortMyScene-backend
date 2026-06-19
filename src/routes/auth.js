const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authValidators, validate } = require('../middleware/validators');

router.post('/send-otp', authController.sendOtp);
router.post('/register', authValidators.register, validate, authController.register);
// remove the old /verify-otp route, we don't need it anymore!

router.post('/login', authValidators.login, validate, authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout); 

module.exports = router;