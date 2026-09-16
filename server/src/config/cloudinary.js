import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Check if valid credentials are provided (not placeholders)
export const isCloudinaryConfigured = () => {
  return (
    !!cloudName &&
    !!apiKey &&
    !!apiSecret &&
    apiKey !== 'placeholder_api_key' &&
    apiKey !== 'your_cloudinary_api_key' &&
    apiSecret !== 'placeholder_api_secret' &&
    apiSecret !== 'your_cloudinary_api_secret'
  );
};

// Configure Cloudinary SDK
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  console.log('[Cloudinary] Initialized with cloud:', cloudName);
} else {
  console.log('[Cloudinary] Running in local/simulated mode (placeholder keys detected).');
}

export default cloudinary;
