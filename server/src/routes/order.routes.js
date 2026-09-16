import { Router } from 'express';
import {
  createOrderRequest,
  getMyOrders,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { verifyJWT, requireAdmin } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';

const router = Router();

// Customer Order Request Endpoint
router.post(
  '/',
  validateBody(['customerInfo', 'shippingAddress', 'items']),
  createOrderRequest
);

// Authenticated Customer's Order History
router.get('/my-orders', verifyJWT, getMyOrders);

// Single Order Query Endpoint (by ID or orderNumber)
router.get('/:id', getOrderDetails);

// Admin-Only Order Endpoints
router.get('/', verifyJWT, requireAdmin, getAllOrders);
router.put('/:id/status', verifyJWT, requireAdmin, validateBody(['status']), updateOrderStatus);

export default router;
