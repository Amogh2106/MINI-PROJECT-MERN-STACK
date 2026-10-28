import { asyncHandler } from '../middleware/asyncMiddleware.js';
import * as noteService from '../services/noteService.js';
import { successResponse } from '../utils/apiResponse.js';

export const getNotesByEntity = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const notes = await noteService.getNotesByEntity(entityType, entityId);
  return successResponse(res, notes, 'Notes retrieved successfully');
});

export const createNote = asyncHandler(async (req, res) => {
  const note = await noteService.createNote(req.body, req.user);
  return successResponse(res, note, 'Note created successfully', 201);
});

export const deleteNote = asyncHandler(async (req, res) => {
  await noteService.deleteNote(req.params.id);
  return successResponse(res, null, 'Note deleted successfully');
});
