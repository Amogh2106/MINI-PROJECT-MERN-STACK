import { z } from 'zod';

export const createDealSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Deal title is required').max(150),
    value: z.coerce.number().min(0, 'Value must be positive'),
    stage: z.enum(['lead', 'qualified', 'proposal', 'won', 'lost']).default('lead'),
    expectedCloseDate: z.string().nullable().optional(),
    contact: z.string().nullable().optional(),
    company: z.string().nullable().optional(),
    owner: z.string().optional(),
  }),
});

export const updateDealSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Deal title cannot be empty').max(150).optional(),
    value: z.coerce.number().min(0).optional(),
    stage: z.enum(['lead', 'qualified', 'proposal', 'won', 'lost']).optional(),
    expectedCloseDate: z.string().nullable().optional(),
    contact: z.string().nullable().optional(),
    company: z.string().nullable().optional(),
    owner: z.string().optional(),
  }),
});

export const updateDealStageSchema = z.object({
  body: z.object({
    stage: z.enum(['lead', 'qualified', 'proposal', 'won', 'lost']),
  }),
});

export const getDealsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    stage: z.enum(['lead', 'qualified', 'proposal', 'won', 'lost', '']).optional(),
    owner: z.string().optional(),
    search: z.string().optional(),
  }),
});
