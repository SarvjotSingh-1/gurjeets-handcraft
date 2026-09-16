import { Router } from 'express';
import {
  getAllReviews,
  moderateReview,
  deleteReview,
  getRecentApprovedReviews,
} from '../controllers/review.controller.js';
import { verifyJWT, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public showcase of recent approved reviews
router.get('/recent', getRecentApprovedReviews);

// All review admin management routes are strictly protected
router.use(verifyJWT, requireAdmin);

router.get('/', getAllReviews);
router.put('/:id/moderate', moderateReview);
router.delete('/:id', deleteReview);

export default router;

