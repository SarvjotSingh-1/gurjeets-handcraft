import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import {
  getReviews,
  getReviewEligibility,
  createReview,
} from '../controllers/review.controller.js';
import { verifyJWT, requireAdmin, optionalJWT } from '../middleware/auth.middleware.js';
import { validateBody, validateReview } from '../middleware/validate.middleware.js';

const router = Router();

// Product Reviews Sub-routes
router.get('/:id/reviews/eligibility', optionalJWT, getReviewEligibility);
router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', verifyJWT, validateReview, createReview);

// Public Product Catalog Routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected Admin Product Management Routes
router.post(
  '/',
  verifyJWT,
  requireAdmin,
  validateBody(['title', 'price', 'category', 'craftTechnique', 'material', 'description']),
  createProduct
);

router.put('/:id', verifyJWT, requireAdmin, updateProduct);
router.delete('/:id', verifyJWT, requireAdmin, deleteProduct);

export default router;
