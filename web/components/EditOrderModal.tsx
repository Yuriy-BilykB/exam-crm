'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { OrderDetail } from '@/services/orders.service';
import { getApiErrorMessage } from '@/lib/api/errors';
import { useGroups, useCreateGroup } from '@/hooks/reference/useReferences';
import { useOrderActions } from '@/hooks/orders/useOrderActions';
import {
  editOrderSchema,
  type EditOrderFormValues,
} from '@/lib/validation/order.schema';
import { blankToNull, blankToNumber } from '@/lib/utils/form-values';
import {
  OrderStatusList,
  OrderStatusLabels,
  CourseNameList,
  CourseNameLabels,
  CourseFormatList,
  CourseFormatLabels,
  CourseTypeList,
  CourseTypeLabels,
} from '@/lib/reference/lists';

interface Props {
  order: OrderDetail | null;
  onClose: () => void;
  onSaved: (updated: OrderDetail) => void;
}

function toFormValues(order: OrderDetail | null): EditOrderFormValues {
  return {
    name: order?.name ?? '',
    surname: order?.surname ?? '',
    email: order?.email ?? '',
    phone: order?.phone ?? '',
    age: order?.age?.toString() ?? '',
    sum: order?.sum?.toString() ?? '',
    alreadyPaid: order?.alreadyPaid?.toString() ?? '',
    status: order?.status ?? '',
    course: order?.course ?? '',
    courseFormat: order?.courseFormat ?? '',
    courseType: order?.courseType ?? '',
    groupId: order?.group?.id ?? '',
  };
}

const fieldClass =
  'w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500';

export default function EditOrderModal({ order, onClose, onSaved }: Props) {
  const { data: groups = [] } = useGroups();
  const createGroup = useCreateGroup();
  const { updateOrder } = useOrderActions();
  const [newGroupName, setNewGroupName] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditOrderFormValues>({
    resolver: zodResolver(editOrderSchema),
    defaultValues: toFormValues(order),
  });

  const handleAddGroup = async () => {
    const name = newGroupName.trim();
    if (!name || createGroup.isPending) {
      return;
    }
    try {
      const group = await createGroup.mutateAsync(name);
      setValue('groupId', String(group.id));
      setNewGroupName('');
    } catch (e) {
      setError('root', { message: getApiErrorMessage(e, 'Failed to add group') });
    }
  };

  const onSubmit = async (values: EditOrderFormValues) => {
    if (!order) {
      return;
    }
    try {
      const updated = await updateOrder.mutateAsync({
        id: order.id,
        data: {
          name: blankToNull(values.name),
          surname: blankToNull(values.surname),
          email: blankToNull(values.email),
          phone: blankToNull(values.phone),
          age: blankToNumber(values.age),
          sum: blankToNumber(values.sum),
          alreadyPaid: blankToNumber(values.alreadyPaid),
          status: blankToNull(values.status),
          course: blankToNull(values.course),
          courseFormat: blankToNull(values.courseFormat),
          courseType: blankToNull(values.courseType),
          groupId: blankToNull(values.groupId),
        },
      });
      onSaved(updated);
      onClose();
    } catch (e) {
      setError('root', { message: getApiErrorMessage(e, 'Failed to update') });
    }
  };

  if (!order) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Edit order #{order.id}</h2>
          {errors.root && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {errors.root.message}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                  <select {...register('groupId')} className={fieldClass}>
                    <option value="">—</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="New group name"
                      className={`${fieldClass} flex-1 text-sm`}
                    />
                    <button
                      type="button"
                      onClick={handleAddGroup}
                      disabled={createGroup.isPending || !newGroupName.trim()}
                      className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                    >
                      ADD GROUP
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" className={fieldClass} disabled={isSubmitting} {...register('name')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                  <input type="text" className={fieldClass} disabled={isSubmitting} {...register('surname')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className={fieldClass} disabled={isSubmitting} {...register('email')} />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" className={fieldClass} disabled={isSubmitting} {...register('phone')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input type="number" className={fieldClass} disabled={isSubmitting} {...register('age')} />
                  {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select {...register('status')} className={fieldClass} disabled={isSubmitting}>
                    <option value="">—</option>
                    {OrderStatusList.map((s) => (
                      <option key={s} value={s}>{OrderStatusLabels[s]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sum</label>
                  <input type="number" className={fieldClass} disabled={isSubmitting} {...register('sum')} />
                  {errors.sum && <p className="mt-1 text-sm text-red-600">{errors.sum.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Already paid</label>
                  <input type="number" className={fieldClass} disabled={isSubmitting} {...register('alreadyPaid')} />
                  {errors.alreadyPaid && (
                    <p className="mt-1 text-sm text-red-600">{errors.alreadyPaid.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select {...register('course')} className={fieldClass} disabled={isSubmitting}>
                    <option value="">—</option>
                    {CourseNameList.map((c) => (
                      <option key={c} value={c}>{CourseNameLabels[c]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course format</label>
                  <select {...register('courseFormat')} className={fieldClass} disabled={isSubmitting}>
                    <option value="">—</option>
                    {CourseFormatList.map((fmt) => (
                      <option key={fmt} value={fmt}>{CourseFormatLabels[fmt]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course type</label>
                  <select {...register('courseType')} className={fieldClass} disabled={isSubmitting}>
                    <option value="">—</option>
                    {CourseTypeList.map((t) => (
                      <option key={t} value={t}>{CourseTypeLabels[t]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-green-500 text-green-500 rounded hover:bg-green-50"
              >
                CLOSE
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'SUBMIT'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
