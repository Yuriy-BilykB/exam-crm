'use client';

import { useState } from 'react';
import type { OrderDetail } from '@/services/orders.service';
import { getApiErrorMessage } from '@/lib/api/errors';
import {
  useCourses,
  useCourseFormats,
  useCourseTypes,
  useStatuses,
  useGroups,
  useCreateGroup,
} from '@/hooks/reference/useReferences';
import { useOrderActions } from '@/hooks/orders/useOrderActions';

interface EditOrderModalProps {
  order: OrderDetail | null;
  onClose: () => void;
  onSaved: (updated: OrderDetail) => void;
}

const TEXT_FIELDS = ['name', 'surname', 'email', 'phone'] as const;
const INT_FIELDS = ['age', 'course_id', 'format_id', 'type_id', 'status_id', 'sum', 'already_paid'] as const;

const initialState = {
  name: '', surname: '', email: '', phone: '', age: '',
  course_id: '', format_id: '', type_id: '', status_id: '', group_id: '',
  sum: '', already_paid: '',
};

// Build the form state from an order. The modal is mounted fresh each time it
// opens, so this runs once as the initial state — no syncing effect needed.
function buildFormState(order: OrderDetail | null) {
  if (!order) return initialState;
  return {
    name: order.name ?? '',
    surname: order.surname ?? '',
    email: order.email ?? '',
    phone: order.phone ?? '',
    age: order.age?.toString() ?? '',
    course_id: order.course?.id.toString() ?? '',
    format_id: order.format?.id.toString() ?? '',
    type_id: order.type?.id.toString() ?? '',
    status_id: order.status?.id.toString() ?? '',
    group_id: order.group?.id.toString() ?? '',
    sum: order.sum?.toString() ?? '',
    already_paid: order.alreadyPaid?.toString() ?? '',
  };
}

export default function EditOrderModal({ order, onClose, onSaved }: EditOrderModalProps) {
  const { data: courses = [] } = useCourses();
  const { data: formats = [] } = useCourseFormats();
  const { data: types = [] } = useCourseTypes();
  const { data: statuses = [] } = useStatuses();
  const { data: groups = [] } = useGroups();

  const createGroup = useCreateGroup();
  const { updateOrder } = useOrderActions();

  const [form, setForm] = useState(() => buildFormState(order));
  const [newGroupName, setNewGroupName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddGroup = async () => {
    const name = newGroupName.trim();
    if (!name || createGroup.isPending) return;
    setError(null);
    try {
      const group = await createGroup.mutateAsync(name);
      setForm((prev) => ({ ...prev, group_id: String(group.id) }));
      setNewGroupName('');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to add group'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || updateOrder.isPending) return;
    setError(null);
    try {
      const payload: Record<string, unknown> = {};
      for (const key of TEXT_FIELDS) {
        if (form[key] !== '') payload[key] = form[key];
      }
      for (const key of INT_FIELDS) {
        if (form[key] !== '') payload[key] = parseInt(form[key], 10);
      }
      payload.group_id = form.group_id !== '' ? parseInt(form.group_id, 10) : null;

      const updated = await updateOrder.mutateAsync({ id: order.id, data: payload });
      onSaved(updated);
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to update'));
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Edit order #{order.id}</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                  <div className="flex gap-2">
                    <select
                      value={form.group_id}
                      onChange={(e) => setForm((f) => ({ ...f, group_id: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500"
                    >
                      <option value="">—</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="New group name"
                      className="flex-1 px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500 text-sm"
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
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                  <input
                    type="text"
                    value={form.surname}
                    onChange={(e) => setForm((f) => ({ ...f, surname: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status_id}
                    onChange={(e) => setForm((f) => ({ ...f, status_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500"
                  >
                    <option value="">—</option>
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sum</label>
                  <input
                    type="number"
                    value={form.sum}
                    onChange={(e) => setForm((f) => ({ ...f, sum: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Already paid</label>
                  <input
                    type="number"
                    value={form.already_paid}
                    onChange={(e) => setForm((f) => ({ ...f, already_paid: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select
                    value={form.course_id}
                    onChange={(e) => setForm((f) => ({ ...f, course_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500"
                  >
                    <option value="">—</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course format</label>
                  <select
                    value={form.format_id}
                    onChange={(e) => setForm((f) => ({ ...f, format_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500"
                  >
                    <option value="">—</option>
                    {formats.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course type</label>
                  <select
                    value={form.type_id}
                    onChange={(e) => setForm((f) => ({ ...f, type_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500"
                  >
                    <option value="">—</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
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
                disabled={updateOrder.isPending}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {updateOrder.isPending ? 'Saving...' : 'SUBMIT'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
