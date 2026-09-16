import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as customOrderService from '../services/customOrder.service.js';

/**
 * Create Custom Order Request
 * POST /api/custom-orders
 */
export const createCustomOrder = asyncHandler(async (req, res) => {
  const result = await customOrderService.createCustomOrder(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, result, 'Custom order request submitted successfully'));
});

/**
 * Get All Custom Order Requests (Admin)
 * GET /api/custom-orders
 */
export const getCustomOrders = asyncHandler(async (req, res) => {
  const orders = await customOrderService.getCustomOrders(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, orders, 'Custom order requests retrieved successfully'));
});

/**
 * Get Custom Order by ID or Number
 * GET /api/custom-orders/:id
 */
export const getCustomOrderById = asyncHandler(async (req, res) => {
  const identifier = req.params.id || req.params.idOrNumber;
  const order = await customOrderService.getCustomOrderByIdOrNumber(identifier);

  return res
    .status(200)
    .json(new ApiResponse(200, order, 'Custom order request retrieved successfully'));
});

/**
 * Update Custom Order (Admin)
 * PUT /api/custom-orders/:id
 */
export const updateCustomOrder = asyncHandler(async (req, res) => {
  const identifier = req.params.id || req.params.idOrNumber;
  const updated = await customOrderService.updateCustomOrder(identifier, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, updated, 'Custom order updated successfully'));
});
