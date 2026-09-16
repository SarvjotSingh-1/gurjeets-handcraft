import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getCategories } from '../services/product.service.js';

/**
 * Get all product categories
 * GET /api/categories
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await getCategories();
  return res
    .status(200)
    .json(new ApiResponse(200, categories, 'Categories retrieved successfully'));
});
