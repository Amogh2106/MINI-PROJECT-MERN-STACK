import { asyncHandler } from '../middleware/asyncMiddleware.js';
import * as authService from '../services/authService.js';
import { sendTokenCookie, clearTokenCookie } from '../utils/token.js';
import { successResponse } from '../utils/apiResponse.js';

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  sendTokenCookie(res, user);
  return successResponse(res, user, 'Registration successful', 201);
});

export const login = asyncHandler(async (req, res) => {
  const user = await authService.loginUser(req.body);
  sendTokenCookie(res, user);
  return successResponse(res, user, 'Login successful', 200);
});

export const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  return successResponse(res, null, 'Logged out successfully', 200);
});

export const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, req.user, 'Current user profile', 200);
});
