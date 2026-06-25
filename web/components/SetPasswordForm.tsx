'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import { useSetPassword } from '@/hooks/auth/useSetPassword';
import { getApiErrorMessage } from '@/lib/api/errors';
import {
  setPasswordSchema,
  type SetPasswordFormValues,
} from '@/lib/validation/set-password.schema';

type Props = {
  title: string;
  submitLabel: string;
  successMessage: string;
};

const screenClass = 'min-h-screen flex items-center justify-center bg-green-500';
const fieldClass =
  'w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500';

export default function SetPasswordForm({ title, submitLabel, successMessage }: Props) {
  const params = useParams();
  const router = useRouter();
  // A `[token]` segment is a string, but useParams types it as string | string[]
  // (catch-all routes can be arrays) — normalize to a single string.
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: '', confirm: '' },
  });

  const setPassword = useSetPassword();

  const onSubmit = async (values: SetPasswordFormValues) => {
    if (!token) {
      return
    };
    try {
      await setPassword.mutateAsync({ token, password: values.password });
      setTimeout(() => router.push('/login'), 2000);
    } catch (e) {
      setError('root', { message: getApiErrorMessage(e, 'Invalid or expired link') });
    }
  };

  if (!token) {
    return (
      <div className={screenClass}>
        <div className="bg-gray-100 rounded-lg p-6 text-gray-700">Invalid link</div>
      </div>
    );
  }

  if (setPassword.isSuccess) {
    return (
      <div className={screenClass}>
        <div className="bg-gray-100 rounded-lg p-6 text-gray-700">{successMessage}</div>
      </div>
    );
  }

  return (
    <div className={screenClass}>
      <div className="bg-gray-100 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">{title}</h1>
        {errors.root && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {errors.root.message}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              className={fieldClass}
              disabled={setPassword.isPending}
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm Password"
              className={fieldClass}
              disabled={setPassword.isPending}
              {...register('confirm')}
            />
            {errors.confirm && (
              <p className="mt-1 text-sm text-red-600">{errors.confirm.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={setPassword.isPending}
            className="w-full py-3 bg-green-500 text-white font-semibold rounded hover:bg-green-600 disabled:opacity-50"
          >
            {setPassword.isPending ? 'Please wait...' : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
