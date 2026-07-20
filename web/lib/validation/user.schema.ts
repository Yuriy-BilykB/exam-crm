import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  role: z.enum(['admin', 'manager']),
  isActive: z.boolean(),
  isBanned: z.boolean(),
  createdAt: z.string(),
});

export type User = z.infer<typeof userSchema>;
