import { asyncHandler } from '../middleware/asyncMiddleware.js';
import * as contactService from '../services/contactService.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

export const getContacts = asyncHandler(async (req, res) => {
  const result = await contactService.getContacts(req.query);
  return paginatedResponse(res, result, 'Contacts retrieved successfully');
});

export const getContactById = asyncHandler(async (req, res) => {
  const contact = await contactService.getContactById(req.params.id);
  return successResponse(res, contact, 'Contact details retrieved');
});

export const createContact = asyncHandler(async (req, res) => {
  const contact = await contactService.createContact(req.body, req.user);
  return successResponse(res, contact, 'Contact created successfully', 201);
});

export const updateContact = asyncHandler(async (req, res) => {
  const contact = await contactService.updateContact(req.params.id, req.body, req.user);
  return successResponse(res, contact, 'Contact updated successfully');
});

export const deleteContact = asyncHandler(async (req, res) => {
  await contactService.deleteContact(req.params.id);
  return successResponse(res, null, 'Contact deleted successfully');
});
