import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import * as cloudinaryService from '../services/cloudinary.service.js';

/**
 * Upload Multiple Product Images
 * POST /api/upload/images
 */
export const uploadProductImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No image files uploaded. Please attach at least one image in the "images" field.');
  }

  const uploadedImages = await cloudinaryService.uploadMultipleImages(req.files);

  return res
    .status(201)
    .json(new ApiResponse(201, uploadedImages, `${uploadedImages.length} product images uploaded successfully.`));
});

/**
 * Delete Product Image by Public ID
 * DELETE /api/upload/images/:publicId(*)
 */
export const deleteProductImage = asyncHandler(async (req, res) => {
  // Public ID might contain slashes (e.g. gurjeets_handcraft/products/img_123)
  const publicId = req.params[0] || req.params.publicId || req.body?.publicId;

  if (!publicId) {
    throw new ApiError(400, 'Cloudinary publicId is required.');
  }

  const result = await cloudinaryService.deleteCloudinaryImage(publicId);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Product image removed from cloud storage.'));
});
