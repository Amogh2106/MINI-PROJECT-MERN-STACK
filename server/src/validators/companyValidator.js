import { z } from 'zod';

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Company name is required').max(150),
    domain: z.string().optional().default(''),
    industry: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    address: z.string().optional().default(''),
    owner: z.string().optional(),
  }),
});

export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Company name cannot be empty').max(150).optional(),
    domain: z.string().optional(),
    industry: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    owner: z.string().optional(),
  }),
});

export const getCompaniesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    owner: z.string().optional(),
  }),
});
