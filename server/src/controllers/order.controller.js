import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as orderService from '../services/order.service.js';

/**
 * Create Order Request
 * POST /api/orders
 */
export const createOrderRequest = asyncHandler(async (req, res) => {
  const result = await orderService.createOrder(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, result, 'Order request submitted successfully'));
});

/**
 * Get Authenticated Customer's Orders
 * GET /api/orders/my-orders
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const customerEmail = req.user?.email;
  const orders = await orderService.getCustomerOrders(customerEmail);

  return res
    .status(200)
    .json(new ApiResponse(200, orders, 'Customer orders retrieved successfully'));
});

/**
 * Get Single Order Details by ID or Order Number
 * GET /api/orders/:id (or :orderIdentifier)
 */
export const getOrderDetails = asyncHandler(async (req, res) => {
  const identifier = req.params.id || req.params.orderIdentifier;
  const order = await orderService.getOrderByIdOrNumber(identifier);

  return res
    .status(200)
    .json(new ApiResponse(200, order, 'Order request retrieved successfully'));
});

/**
 * Get All Orders (Admin)
 * GET /api/orders
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrders(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, orders, 'Orders retrieved successfully'));
});

/**
 * Update Order Status (Admin)
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const identifier = req.params.id || req.params.orderIdentifier;
  const { status, artisanNotes, orderConfirmationMethod } = req.body;

  const updatedOrder = await orderService.updateOrderStatus(identifier, {
    status,
    artisanNotes,
    orderConfirmationMethod,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedOrder, `Order status updated to "${status}"`));
});
