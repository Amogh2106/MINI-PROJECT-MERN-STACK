import { asyncHandler } from '../middleware/asyncMiddleware.js';
import * as companyService from '../services/companyService.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

export const getCompanies = asyncHandler(async (req, res) => {
  const result = await companyService.getCompanies(req.query);
  return paginatedResponse(res, result, 'Companies retrieved successfully');
});

export const getCompanyById = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyById(req.params.id);
  return successResponse(res, company, 'Company details retrieved');
});

export const createCompany = asyncHandler(async (req, res) => {
  const company = await companyService.createCompany(req.body, req.user);
  return successResponse(res, company, 'Company created successfully', 201);
});

export const updateCompany = asyncHandler(async (req, res) => {
  const company = await companyService.updateCompany(req.params.id, req.body, req.user);
  return successResponse(res, company, 'Company updated successfully');
});

export const deleteCompany = asyncHandler(async (req, res) => {
  await companyService.deleteCompany(req.params.id);
  return successResponse(res, null, 'Company deleted successfully');
});
