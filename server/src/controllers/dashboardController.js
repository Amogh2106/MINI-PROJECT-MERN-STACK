import { asyncHandler } from '../middleware/asyncMiddleware.js';
import * as dashboardService from '../services/dashboardService.js';
import { successResponse } from '../utils/apiResponse.js';

export const getDashboardData = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardMetrics(req.user);
  return successResponse(res, data, 'Dashboard data retrieved successfully');
});
