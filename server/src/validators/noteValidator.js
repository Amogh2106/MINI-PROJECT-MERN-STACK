import { z } from 'zod';

export const createNoteSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Note content cannot be empty').max(2000),
    entityType: z.enum(['contact', 'deal']),
    entityId: z.string().min(1, 'Entity ID is required'),
  }),
});
