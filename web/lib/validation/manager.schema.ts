import { z } from 'zod';

export const createManagerSchema = z.object({
  email: z.email('Enter a valid email').max(100, 'Email must be at most 100 characters'),
  name: z.string().trim().max(50, 'Name must be at most 50 characters').optional(),
  surname: z.string().trim().max(50, 'Surname must be at most 50 characters').optional(),
});

export type CreateManagerFormValues = z.infer<typeof createManagerSchema>;
