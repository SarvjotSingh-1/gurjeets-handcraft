import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Upload a single image buffer directly to Cloudinary or save locally if unconfigured
 * @param {Buffer} buffer - File buffer from Multer memory storage
 * @param {string} originalname - Original file name for reference
 * @returns {Promise<{ url: string, publicId: string, format: string, bytes: number }>}
 */
export const uploadImageBuffer = (buffer, originalname = 'product-image') => {
  return new Promise((resolve, reject) => {
    if (!buffer || buffer.length === 0) {
      return reject(new ApiError(400, 'Image buffer is empty or missing.'));
    }

    // Clean name for public_id suffix
    const sanitizedBase = originalname
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    const ext = path.extname(originalname) || '.jpg';
    const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;
    const filename = `${sanitizedBase}_${uniqueSuffix}${cleanExt}`;

    if (isCloudinaryConfigured()) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'gurjeets_handcraft/products',
          public_id: `${sanitizedBase}_${uniqueSuffix}`,
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1600, crop: 'limit' },
          ],
        },
        (error, result) => {
          if (error) {
            console.warn('[Cloudinary Stream Error, falling back to local storage]:', error.message);
            try {
              const localFilePath = path.join(UPLOADS_DIR, filename);
              fs.writeFileSync(localFilePath, buffer);
              return resolve({
                url: `/uploads/${filename}`,
                publicId: `local_${filename}`,
                format: cleanExt.replace('.', ''),
                bytes: buffer.length,
              });
            } catch (localErr) {
              return reject(new ApiError(500, `Failed to store image: ${localErr.message}`));
            }
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
          });
        }
      );

      uploadStream.end(buffer);
    } else {
      // Local development storage when real Cloudinary credentials are not set
      try {
        const localFilePath = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(localFilePath, buffer);
        console.log(`[Local Upload] Saved image to local storage: ${filename}`);

        resolve({
          url: `/uploads/${filename}`,
          publicId: `local_${filename}`,
          format: cleanExt.replace('.', ''),
          bytes: buffer.length,
        });
      } catch (err) {
        console.error('[Local Upload Error]', err);
        reject(new ApiError(500, `Failed to save image locally: ${err.message}`));
      }
    }
  });
};

/**
 * Upload multiple image buffers sequentially or in parallel
 * @param {Array<Express.Multer.File>} files - Multer files array
 * @returns {Promise<Array<{ url: string, publicId: string, alt: string, isPrimary: boolean }>>}
 */
export const uploadMultipleImages = async (files) => {
  if (!files || files.length === 0) {
    throw new ApiError(400, 'Please select at least one image file to upload.');
  }

  const uploadPromises = files.map(async (file, index) => {
    const uploaded = await uploadImageBuffer(file.buffer, file.originalname);
    return {
      url: uploaded.url,
      publicId: uploaded.publicId,
      alt: file.originalname.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      isPrimary: index === 0, // First uploaded image default primary
    };
  });

  return await Promise.all(uploadPromises);
};

/**
 * Delete an image from Cloudinary or local disk using its public ID
 * @param {string} publicId - Cloudinary public ID or local ID
 * @returns {Promise<Object>}
 */
export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) {
    throw new ApiError(400, 'Public ID is required for image deletion.');
  }

  // Handle local image file deletion
  if (publicId.startsWith('local_')) {
    const filename = publicId.replace('local_', '');
    const localFilePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
        console.log(`[Local Upload] Removed local file: ${filename}`);
      } catch (err) {
        console.warn('[Local Upload] Could not remove local file:', err.message);
      }
    }
    return { success: true, result: 'deleted_locally', publicId };
  }

  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return { success: true, result: result.result, publicId };
    } catch (err) {
      console.warn('[Cloudinary Delete Error]', err.message);
      return { success: false, error: err.message, publicId };
    }
  }

  return { success: true, result: 'simulated_ok', publicId };
};
