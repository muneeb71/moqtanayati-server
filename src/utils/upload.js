const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for images and video
const fileFilter = (req, file, cb) => {
  const imageTypes = /\.(jpg|jpeg|png|gif|webp)$/i;
  const videoTypes = /\.(mp4|webm|mov|avi)$/i;
  if (file.fieldname === 'images') {
    if (!imageTypes.test(file.originalname)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
  } else if (file.fieldname === 'video') {
    if (!videoTypes.test(file.originalname)) {
      return cb(new Error('Only video files are allowed!'), false);
    }
  } else {
    return cb(new Error('Invalid file field!'), false);
  }
  cb(null, true);
};

// Multer instance for product uploads
const productUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max per file
  },
});

// Export a middleware for up to 12 images and 1 video
const productMediaUpload = productUpload.fields([
  { name: 'images', maxCount: 12 },
  { name: 'video', maxCount: 1 },
]);

module.exports = productMediaUpload; 