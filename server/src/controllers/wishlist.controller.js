import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as wishlistService from '../services/wishlist.service.js';

/**
 * Get User Wishlist
 * GET /api/wishlist
 */
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.getWishlist(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, wishlist, 'Wishlist retrieved successfully'));
});

/**
 * Add Product to Wishlist
 * POST /api/wishlist
 */
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const wishlist = await wishlistService.addToWishlist(req.user._id, productId);

  return res
    .status(200)
    .json(new ApiResponse(200, wishlist, 'Product added to wishlist'));
});

/**
 * Remove Product from Wishlist
 * DELETE /api/wishlist/:productId
 */
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const wishlist = await wishlistService.removeFromWishlist(req.user._id, productId);

  return res
    .status(200)
    .json(new ApiResponse(200, wishlist, 'Product removed from wishlist'));
});
