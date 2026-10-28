import { z } from 'zod';

export const createContactSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Please enter a valid email'),
    phone: z.string().optional().default(''),
    company: z.string().nullable().optional(),
    status: z.enum(['lead', 'active', 'inactive']).default('lead'),
    owner: z.string().optional(),
  }),
});

export const updateContactSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name cannot be empty').max(100).optional(),
    email: z.string().email('Please enter a valid email').optional(),
    phone: z.string().optional(),
    company: z.string().nullable().optional(),
    status: z.enum(['lead', 'active', 'inactive']).optional(),
    owner: z.string().optional(),
  }),
});

export const getContactsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    status: z.enum(['lead', 'active', 'inactive', '']).optional(),
    owner: z.string().optional(),
  }),
});
