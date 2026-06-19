const adminService = require('../services/adminService');

// CREATE a dynamic event
const createEvent = async (req, res, next) => {
  try {
    const event = await adminService.createEvent(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

const uploadAdminImage = async (req, res, next) => {
  try {
    // Double check that Multer parsed and populated the file payload
    if (!req.file) {
      console.error('❌ Upload controller failed: req.file is undefined');
      return res.status(400).json({ success: false, message: 'No image file provided or stream failed.' });
    }

    // the file successfully
    console.log('File successfully processed by Multer. Cloudinary URL:', req.file.path);

    // req.file.path contains the verified secure Cloudinary URL link
    return res.status(200).json({ 
      success: true, 
      url: req.file.path 
    });

  } catch (error) {
    console.error('Exception occurred during controller payload response mapping:', error);
    next(error);
  }
};

// UPDATE an event
const updateEvent = async (req, res, next) => {
  try {
    const event = await adminService.updateEvent(req.params.id, req.body);
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// DELETE an event
const deleteEvent = async (req, res, next) => {
  try {
    await adminService.deleteEvent(req.params.id);
    res.status(200).json({ success: true, message: 'Event deleted perfectly' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createEvent, updateEvent, deleteEvent ,uploadAdminImage};