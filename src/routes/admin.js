const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary'); 

// Protect all admin routes
router.use(authenticate, authorize('admin'));

// Image Upload Route with Custom Error Interception Sandbox
router.post('/upload', (req, res, next) => {
  // Execute multer manually to trap any stream errors safely
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('🚨 [FILE REJECTED]:', err.message);
      
      return res.status(400).json({ 
        success: false, 
        message: err.message || 'File upload failed. Only JPG, JPEG, and PNG are allowed.' 
      });
    }

    console.log('File passed custom stream filters. Passing execution to controller...');
    return adminController.uploadAdminImage(req, res, next);
  });
});

router.post('/events', adminController.createEvent);
router.put('/events/:id', adminController.updateEvent);
router.delete('/events/:id', adminController.deleteEvent);

module.exports = router;