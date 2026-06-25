import { z } from 'zod';

export const createManagerSchema = z.object({
  email: z.email('Enter a valid email'),
  name: z.string().trim().optional(),
  surname: z.string().trim().optional(),
});

export type CreateManagerFormValues = z.infer<typeof createManagerSchema>;
