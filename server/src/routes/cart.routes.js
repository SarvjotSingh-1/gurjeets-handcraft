import { Router } from 'express';
import { verifyCart } from '../controllers/cart.controller.js';

const router = Router();

// Public cart verification route
router.post('/verify', verifyCart);

export default router;
