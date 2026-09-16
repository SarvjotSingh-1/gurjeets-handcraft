import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as cartService from '../services/cart.service.js';

/**
 * Verify Shopping Cart Items
 * POST /api/cart/verify
 * Validates real database price, availability, and stock limits.
 */
export const verifyCart = asyncHandler(async (req, res) => {
  const items = req.body.items || [];
  const verifiedCart = await cartService.verifyCart(items);

  return res
    .status(200)
    .json(new ApiResponse(200, verifiedCart, 'Cart verified successfully against live catalog.'));
});
