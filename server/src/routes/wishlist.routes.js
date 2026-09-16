import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/wishlist.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';

const router = Router();

// All Wishlist routes require authentication
router.use(verifyJWT);

router.get('/', getWishlist);
router.post('/', validateBody(['productId']), addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
