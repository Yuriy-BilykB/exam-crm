import { AxiosError } from 'axios';
import { z } from 'zod';

const errorDataSchema = z.object({
  message: z.union([z.string(), z.array(z.string())]).optional(),
});

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong',
): string {
  if (error instanceof AxiosError) {
    const parsed = errorDataSchema.safeParse(error.response?.data);
    const message = parsed.success ? parsed.data.message : undefined;
    if (Array.isArray(message)) {return message[0] ?? fallback;}
    return message ?? error.message ?? fallback;
  }
  if (error instanceof Error) {return error.message;}
  return fallback;
}
