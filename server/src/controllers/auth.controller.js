import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as authService from '../services/auth.service.js';

/**
 * Register User
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, adminSecret } = req.body;

  const result = await authService.registerUser({
    name,
    email,
    password,
    phone,
    role,
    adminSecret,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, result, 'User registered successfully'));
});

/**
 * Login User
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.loginUser({ email, password });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Login successful'));
});

/**
 * Get Current User
 * GET /api/auth/me
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Current user profile retrieved'));
});
