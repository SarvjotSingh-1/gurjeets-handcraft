import api from './client';

/**
 * Centralized Review API Service
 * Manages customer reviews, rating calculations, verified eligibility checks,
 * and admin moderation/deletion.
 */
export const reviewService = {
  /**
   * Fetch reviews and statistics for a product
   * @param {string} productId - Product ID or slug
   * @returns {Promise<{ reviews: Array, stats: Object }>}
   */
  async getProductReviews(productId) {
    if (!productId) {
      return {
        reviews: [],
        stats: {
          averageRating: 0,
          ratingCount: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          distributionPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      };
    }

    const res = await api.get(`/products/${encodeURIComponent(productId)}/reviews`);
    const payload = res?.data || res;

    if (payload?.reviews && payload?.stats) {
      return payload;
    }

    if (Array.isArray(payload)) {
      return {
        reviews: payload,
        stats: {
          averageRating: 0,
          ratingCount: payload.length,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          distributionPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      };
    }

    return {
      reviews: [],
      stats: {
        averageRating: 0,
        ratingCount: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        distributionPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      },
    };
  },

  /**
   * Check if current user is eligible to write a review
   * @param {string} productId
   * @returns {Promise<{ isEligible: boolean, isVerifiedBuyer: boolean, hasReviewed: boolean, reason: string }>}
   */
  async getEligibility(productId) {
    if (!productId) {
      return { isEligible: false, isVerifiedBuyer: false, hasReviewed: false, reason: '' };
    }

    try {
      const res = await api.get(`/products/${encodeURIComponent(productId)}/reviews/eligibility`);
      return res?.data || res;
    } catch (err) {
      return {
        isEligible: false,
        isVerifiedBuyer: false,
        hasReviewed: false,
        reason: err.message || 'Unable to check review eligibility',
      };
    }
  },

  /**
   * Submit a verified customer review
   * @param {string} productId
   * @param {{ rating: number, comment: string, userName?: string }} reviewData
   * @returns {Promise<Object>}
   */
  async submitReview(productId, reviewData) {
    const res = await api.post(`/products/${encodeURIComponent(productId)}/reviews`, reviewData);
    return res?.data || res;
  },

  /**
   * Public: Get recent verified and approved reviews across all creations
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getRecentApprovedReviews(limit = 6) {
    try {
      const res = await api.get('/reviews/recent', { params: { limit } });
      const payload = res?.data || res;
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      console.warn('Failed to load recent reviews:', err.message);
      return [];
    }
  },

  /**
   * Admin: Get all reviews across all creations
   * @returns {Promise<Array>}
   */
  async getAllReviews() {
    const res = await api.get('/reviews');
    const payload = res?.data || res;
    return Array.isArray(payload) ? payload : [];
  },

  /**
   * Admin: Toggle approval / moderation of a review
   * @param {string} reviewId
   * @param {boolean} isApproved
   */
  async moderateReview(reviewId, isApproved) {
    const res = await api.put(`/reviews/${encodeURIComponent(reviewId)}/moderate`, { isApproved });
    return res?.data || res;
  },

  /**
   * Admin: Delete inappropriate review
   * @param {string} reviewId
   */
  async deleteReview(reviewId) {
    const res = await api.delete(`/reviews/${encodeURIComponent(reviewId)}`);
    return res?.data || res;
  },
};

export default reviewService;

