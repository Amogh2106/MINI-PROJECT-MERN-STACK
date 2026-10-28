import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkOwnership } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import Task from '../models/Task.js';
import {
  createTaskSchema,
  updateTaskSchema,
  getTasksQuerySchema,
} from '../validators/taskValidator.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(validate(getTasksQuerySchema), taskController.getTasks)
  .post(validate(createTaskSchema), taskController.createTask);

router
  .route('/:id')
  .get(taskController.getTaskById)
  .put(checkOwnership(Task), validate(updateTaskSchema), taskController.updateTask)
  .delete(checkOwnership(Task), taskController.deleteTask);

export default router;
