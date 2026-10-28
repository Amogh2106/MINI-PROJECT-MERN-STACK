import { asyncHandler } from '../middleware/asyncMiddleware.js';
import * as dealService from '../services/dealService.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

export const getDeals = asyncHandler(async (req, res) => {
  const result = await dealService.getDeals(req.query);
  return paginatedResponse(res, result, 'Deals retrieved successfully');
});

export const getDealById = asyncHandler(async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  return successResponse(res, deal, 'Deal details retrieved');
});

export const createDeal = asyncHandler(async (req, res) => {
  const deal = await dealService.createDeal(req.body, req.user);
  return successResponse(res, deal, 'Deal created successfully', 201);
});

export const updateDeal = asyncHandler(async (req, res) => {
  const deal = await dealService.updateDeal(req.params.id, req.body, req.user);
  return successResponse(res, deal, 'Deal updated successfully');
});

export const updateDealStage = asyncHandler(async (req, res) => {
  const deal = await dealService.updateDealStage(req.params.id, req.body.stage);
  return successResponse(res, deal, 'Deal stage updated successfully');
});

export const deleteDeal = asyncHandler(async (req, res) => {
  await dealService.deleteDeal(req.params.id);
  return successResponse(res, null, 'Deal deleted successfully');
});
