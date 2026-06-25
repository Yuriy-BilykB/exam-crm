'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getApiErrorMessage } from '@/lib/api/errors';
import {
  createManagerSchema,
  type CreateManagerFormValues,
} from '@/lib/validation/manager.schema';

type UserCredentialsType = { email: string; name?: string; surname?: string };

type Props = {
  onClose: () => void;
  onCreate: (data: UserCredentialsType) => Promise<unknown>;
};

export default function CreateManagerModal({ onClose, onCreate }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateManagerFormValues>({
    resolver: zodResolver(createManagerSchema),
    defaultValues: { email: '', name: '', surname: '' },
  });

  const onSubmit = async (values: CreateManagerFormValues) => {
    const payload: UserCredentialsType = { email: values.email };
    if (values.name) payload.name = values.name;
    if (values.surname) payload.surname = values.surname;
    try {
      console.log(payload, '>>>>>>>>');

      await onCreate(payload);
      onClose();
    } catch (e) {
      setError('root', { message: getApiErrorMessage(e, 'Failed') });
    }
  };

  const fieldClass =
    'w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Create manager</h2>
        {errors.root && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {errors.root.message}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Email"
              className={fieldClass}
              disabled={isSubmitting}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="Name"
              className={fieldClass}
              disabled={isSubmitting}
              {...register('name')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
            <input
              type="text"
              placeholder="Surname"
              className={fieldClass}
              disabled={isSubmitting}
              {...register('surname')}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-green-500 text-green-500 rounded hover:bg-green-50"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              CREATE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
