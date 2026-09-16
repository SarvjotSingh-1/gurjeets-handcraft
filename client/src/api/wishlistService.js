import api from './client';

/**
 * Centralized Wishlist API Service
 * Encapsulates all backend wishlist queries, addition, and removal
 */
export const wishlistService = {
  /**
   * Fetch authenticated customer's wishlist
   * @returns {Promise<Array>}
   */
  async getWishlist() {
    try {
      const res = await api.get('/wishlist');
      const payload = res?.data || res;
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      console.warn('Failed to fetch wishlist from server:', err.message);
      return [];
    }
  },

  /**
   * Add a product to the customer's account wishlist
   * @param {string} productId
   * @returns {Promise<Array>}
   */
  async addToWishlist(productId) {
    if (!productId) throw new Error('Product ID is required');
    const res = await api.post('/wishlist', { productId });
    const payload = res?.data || res;
    return Array.isArray(payload) ? payload : [];
  },

  /**
   * Remove a product from the customer's account wishlist
   * @param {string} productId
   * @returns {Promise<Array>}
   */
  async removeFromWishlist(productId) {
    if (!productId) throw new Error('Product ID is required');
    const res = await api.delete(`/wishlist/${encodeURIComponent(productId)}`);
    const payload = res?.data || res;
    return Array.isArray(payload) ? payload : [];
  },
};

export default wishlistService;
