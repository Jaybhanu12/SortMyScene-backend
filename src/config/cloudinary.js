const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Ensure your cloudinary config is loaded here
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sortmyscene_events',
    // Remove "allowed_formats" from here! Let Cloudinary accept it, 
    // because WE are doing the strict validation via Multer below.
  },
});

// ✅ STRICT PRODUCTION VALIDATION: Filter files at the stream boundary
const strictFileFilter = (req, file, cb) => {
  // Grab file extension and mimetype
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  const mimeType = file.mimetype;

  console.log(`Incoming file validation - Extension: .${fileExtension}, Mime: ${mimeType}`);

  // Only allow explicit image formats
  if (
    (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png') &&
    (mimeType === 'image/jpeg' || mimeType === 'image/jpg' || mimeType === 'image/png')
  ) {
    // Accept the file safely
    return cb(null, true);
  }

  return cb(new Error('File validation failed: Only .jpg, .jpeg, and .png image formats are allowed.'), false);
};

// Initialize Multer with our custom production guards
const upload = multer({
  storage: storage,
  fileFilter: strictFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

module.exports = { upload };