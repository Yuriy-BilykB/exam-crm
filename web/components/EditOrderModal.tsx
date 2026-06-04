'use client';

import { useState, useEffect } from 'react';
import type { OrderDetail } from '@/services/orders.service';
import ordersService from '@/services/orders.service';
import referenceService from '@/lib/api/reference.service';
import type { Course, CourseFormat, CourseType, Status, Group } from '@/lib/api/reference.service';

interface EditOrderModalProps {
  order: OrderDetail | null;
  onClose: () => void;
  onSaved: (updated: OrderDetail) => void;
}

export default function EditOrderModal({ order, onClose, onSaved }: EditOrderModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formats, setFormats] = useState<CourseFormat[]>([]);
  const [types, setTypes] = useState<CourseType[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [addingGroup, setAddingGroup] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    age: '',
    course_id: '',
    format_id: '',
    type_id: '',
    status_id: '',
    group_id: '',
    sum: '',
    already_paid: '',
  });

  useEffect(() => {
    if (!order) return;
    setForm({
      name: order.name ?? '',
      surname: order.surname ?? '',
      email: order.email ?? '',
      phone: order.phone ?? '',
      age: order.age != null ? String(order.age) : '',
      course_id: order.course?.id != null ? String(order.course.id) : '',
      format_id: order.format?.id != null ? String(order.format.id) : '',
      type_id: order.type?.id != null ? String(order.type.id) : '',
      status_id: order.status?.id != null ? String(order.status.id) : '',
      group_id: order.group?.id != null ? String(order.group.id) : '',
      sum: order.sum != null ? String(order.sum) : '',
      already_paid: order.alreadyPaid != null ? String(order.alreadyPaid) : '',
    });
  }, [order]);

  useEffect(() => {
    Promise.all([
      referenceService.getCourses(),
      referenceService.getCourseFormats(),
      referenceService.getCourseTypes(),
      referenceService.getStatuses(),
      referenceService.getGroups(),
    ]).then(([c, f, t, s, g]) => {
      setCourses(c);
      setFormats(f);
      setTypes(t);
      setStatuses(s);
      setGroups(g);
    });
  }, []);

  const handleAddGroup = async () => {
    const name = newGroupName.trim();
    if (!name || addingGroup) return;
    setAddingGroup(true);
    setError(null);
    try {
      const group = await referenceService.createGroup(name);
      setGroups((prev) => [...prev, group]);
      setForm((prev) => ({ ...prev, group_id: String(group.id) }));
      setNewGroupName('');
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add group');
    } finally {
      setAddingGroup(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || saving) return;
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {};
      if (form.name !== '') payload.name = form.name;
      if (form.surname !== '') payload.surname = form.surname;
      if (form.email !== '') payload.email = form.email;
      if (form.phone !== '') payload.phone = form.phone;
      if (form.age !== '') payload.age = parseInt(form.age, 10);
      if (form.course_id !== '') payload.course_id = parseInt(form.course_id, 10);
      if (form.format_id !== '') payload.format_id = parseInt(form.format_id, 10);
      if (form.type_id !== '') payload.type_id = parseInt(form.type_id, 10);
      if (form.status_id !== '') payload.status_id = parseInt(form.status_id, 10);
      if (form.group_id !== '') payload.group_id = parseInt(form.group_id, 10);
      if (form.group_id === '') payload.group_id = null;
      if (form.sum !== '') payload.sum = parseInt(form.sum, 10);
      if (form.already_paid !== '') payload.already_paid = parseInt(form.already_paid, 10);
      const updated = await ordersService.updateOrder(order.id, payload);
      onSaved(updated);
      onClose();
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
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
                      disabled={addingGroup || !newGroupName.trim()}
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
                disabled={saving}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'SUBMIT'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
