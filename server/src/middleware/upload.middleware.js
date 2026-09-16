import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

// Strictly use in-memory storage so image binaries are never written to disk or database
const storage = multer.memoryStorage();

// Allowed MIME types for handcrafted woolen product photography
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
];

// Allowed extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

const fileFilter = (req, file, cb) => {
  const ext = file.originalname ? file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase() : '';
  const isMimeValid = ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase());
  const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file "${file.originalname}". Only JPEG, PNG, WebP, and AVIF image formats are allowed.`
      ),
      false
    );
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per image
    files: 8, // Max 8 images per upload
  },
});

/**
 * Middleware handling multiple product image uploads with graceful Multer error interception
 */
export const uploadProductImagesMiddleware = (req, res, next) => {
  const uploadArray = upload.array('images', 8);

  uploadArray(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, 'Image file size exceeds the 5MB maximum limit.'));
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return next(new ApiError(400, 'Maximum of 8 product images allowed per upload.'));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new ApiError(400, 'Unexpected upload field name. Form field must be "images".'));
      }
      return next(new ApiError(400, `Upload error: ${err.message}`));
    }
    if (err) {
      return next(err);
    }
    next();
  });
};
