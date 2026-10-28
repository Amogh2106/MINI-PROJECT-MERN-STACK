import { asyncHandler } from '../middleware/asyncMiddleware.js';
import * as taskService from '../services/taskService.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

export const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getTasks(req.query, req.user);
  return paginatedResponse(res, result, 'Tasks retrieved successfully');
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  return successResponse(res, task, 'Task retrieved successfully');
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body, req.user);
  return successResponse(res, task, 'Task created successfully', 201);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user);
  return successResponse(res, task, 'Task updated successfully');
});

export const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id);
  return successResponse(res, null, 'Task deleted successfully');
});
