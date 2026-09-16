import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as productService from '../services/product.service.js';

export { INITIAL_PRODUCTS, ensureSeededProducts } from '../services/product.service.js';

/**
 * Get Products (with filtering, category, search, sorting)
 * GET /api/products
 */
export const getProducts = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, availability, featured, sort, page, limit } = req.query;

  const result = await productService.getProducts({
    category,
    search,
    minPrice,
    maxPrice,
    availability,
    featured,
    sort,
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Handmade products retrieved successfully'));
});

/**
 * Get Product by ID or Slug
 * GET /api/products/:id
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productService.getProductByIdOrSlug(id);

  return res
    .status(200)
    .json(new ApiResponse(200, product, 'Product retrieved successfully'));
});

/**
 * Backward compatibility alias for slug route
 */
export const getProductBySlug = getProductById;

/**
 * Create Product (Admin only)
 * POST /api/products
 */
export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, product, 'Product created successfully'));
});

/**
 * Update Product (Admin only)
 * PUT /api/products/:id
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedProduct = await productService.updateProduct(id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, 'Product updated successfully'));
});

/**
 * Delete Product (Admin only)
 * DELETE /api/products/:id
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedProduct = await productService.deleteProduct(id);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedProduct, 'Product deleted successfully'));
});
