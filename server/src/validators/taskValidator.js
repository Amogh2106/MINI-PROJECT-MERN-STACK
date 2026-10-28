import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Task title is required').max(200),
    dueDate: z.string().min(1, 'Due date is required'),
    status: z.enum(['open', 'done']).default('open'),
    contact: z.string().nullable().optional(),
    deal: z.string().nullable().optional(),
    owner: z.string().optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Task title cannot be empty').max(200).optional(),
    dueDate: z.string().optional(),
    status: z.enum(['open', 'done']).optional(),
    contact: z.string().nullable().optional(),
    deal: z.string().nullable().optional(),
    owner: z.string().optional(),
  }),
});

export const getTasksQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('50'),
    status: z.enum(['open', 'done', '']).optional(),
    dueToday: z.enum(['true', 'false', '']).optional(),
    myTasks: z.enum(['true', 'false', '']).optional(),
    owner: z.string().optional(),
  }),
});
