import { AxiosError } from 'axios';

/** Pull a human-readable message out of an API/network error. */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong',
): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    const message = data?.message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    return message ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
