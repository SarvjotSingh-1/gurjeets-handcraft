import api from './client';

/**
 * Centralized Product API Service
 * Encapsulates all backend catalog queries, product details, categories,
 * filtering, sorting, and related items.
 */
export const productService = {
  /**
   * Fetch products with optional filtering, search, pagination, and sorting
   * @param {Object} params - { category, search, minPrice, maxPrice, availability, featured, sort, page, limit }
   * @returns {Promise<{ products: Array, total: number, page: number, limit: number }>}
   */
  async getProducts(params = {}) {
    const cleanParams = {};
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'all') {
        cleanParams[key] = val;
      }
    });

    const res = await api.get('/products', { params: cleanParams });

    // Handle standard ApiResponse wrapper: res.data contains { products, total, page, limit }
    const payload = res?.data || res;
    if (payload?.products && Array.isArray(payload.products)) {
      return payload;
    }
    if (Array.isArray(payload)) {
      return { products: payload, total: payload.length, page: 1, limit: payload.length };
    }
    return { products: [], total: 0, page: 1, limit: 20 };
  },

  /**
   * Fetch a single product by MongoDB ID or slug
   * @param {string} idOrSlug - Product ID or unique URL slug
   * @returns {Promise<Object>}
   */
  async getProductByIdOrSlug(idOrSlug) {
    if (!idOrSlug) throw new Error('Product identifier is required');
    const res = await api.get(`/products/${encodeURIComponent(idOrSlug)}`);
    const payload = res?.data || res;
    if (!payload || (typeof payload === 'object' && Object.keys(payload).length === 0)) {
      throw new Error(`Product not found: ${idOrSlug}`);
    }
    return payload;
  },

  /**
   * Fetch all craft categories for filter chips and navigation
   * @returns {Promise<Array<{ slug: string, name: string }>>}
   */
  async getCategories() {
    const res = await api.get('/categories');
    const payload = res?.data || res;
    return Array.isArray(payload) ? payload : [];
  },

  /**
   * Fetch related handmade products from the same category
   * @param {string} category - Product category
   * @param {string} currentSlug - Current product slug to exclude
   * @param {number} limit - Maximum number of related items
   * @returns {Promise<Array>}
   */
  async getRelatedProducts(category, currentSlug, limit = 3) {
    try {
      const res = await this.getProducts({
        category: category && category !== 'all' ? category : undefined,
        limit: limit + 3,
      });
      const list = res.products || [];
      return list.filter((p) => p.slug !== currentSlug).slice(0, limit);
    } catch (err) {
      console.warn('Unable to load related products:', err.message);
      return [];
    }
  },
};

export default productService;
