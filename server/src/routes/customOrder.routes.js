import { Router } from 'express';
import {
  createCustomOrder,
  getCustomOrders,
  getCustomOrderById,
  updateCustomOrder,
} from '../controllers/customOrder.controller.js';
import { verifyJWT, requireAdmin } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';

const router = Router();

// Customer Custom Order Submission
router.post(
  '/',
  validateBody(['name', 'email', 'phone', 'productType', 'colorPreference', 'size', 'designPattern']),
  createCustomOrder
);

// Single Custom Order Lookup
router.get('/:id', getCustomOrderById);

// Admin-Only Routes
router.get('/', verifyJWT, requireAdmin, getCustomOrders);
router.put('/:id', verifyJWT, requireAdmin, updateCustomOrder);
router.patch('/:id/status', verifyJWT, requireAdmin, updateCustomOrder);

export default router;
