import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as reviewService from '../services/review.service.js';

/**
 * Get Reviews and Stats for Product
 * GET /api/products/:id/reviews
 */
export const getReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await reviewService.getProductReviews(id);

  if (req.query.format === 'array') {
    return res
      .status(200)
      .json(new ApiResponse(200, result.reviews, 'Product reviews retrieved successfully'));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Product reviews and rating stats retrieved successfully'));
});

/**
 * Check review submission eligibility for current user
 * GET /api/products/:id/reviews/eligibility
 */
export const getReviewEligibility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const eligibility = await reviewService.checkReviewEligibility(id, req.user || null);

  return res
    .status(200)
    .json(new ApiResponse(200, eligibility, 'Review eligibility checked successfully'));
});

/**
 * Create Review for Product
 * POST /api/products/:id/reviews
 */
export const createReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment, userName } = req.body;

  const review = await reviewService.createProductReview(
    id,
    { rating, comment, userName },
    req.user || null
  );

  return res
    .status(201)
    .json(new ApiResponse(201, review, 'Review submitted successfully'));
});

/**
 * Get All Reviews (Admin only)
 * GET /api/reviews
 */
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getAllReviews();

  return res
    .status(200)
    .json(new ApiResponse(200, reviews, 'All reviews retrieved successfully'));
});

/**
 * Moderate Review (Admin only: toggle isApproved)
 * PUT /api/reviews/:id/moderate
 */
export const moderateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isApproved } = req.body;

  const updatedReview = await reviewService.moderateReview(id, { isApproved });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedReview, `Review status updated to ${isApproved ? 'Approved' : 'Hidden'}`));
});

/**
 * Delete Review (Admin only)
 * DELETE /api/reviews/:id
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedReview = await reviewService.deleteReview(id);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedReview, 'Review removed successfully'));
});

/**
 * Get Recent Approved Reviews (Public endpoint for Home/Community showcase)
 * GET /api/reviews/recent
 */
export const getRecentApprovedReviews = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 6;
  const reviews = await reviewService.getRecentApprovedReviews(limit);

  return res
    .status(200)
    .json(new ApiResponse(200, reviews, 'Recent customer reviews retrieved successfully'));
});
