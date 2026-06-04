'use client';

import { useEffect, useState, useRef } from 'react';
import type { Group, Status, CourseFormat, CourseType } from '@/lib/api/reference.service';

const DEBOUNCE_MS = 400;

interface OrdersFiltersProps {
  searchParams: URLSearchParams;
  onParamsChange: (params: Record<string, string>) => void;
  groups: Group[];
  statuses: Status[];
  formats: CourseFormat[];
  types: CourseType[];
  onExport: () => void;
  exportLoading?: boolean;
}

export default function OrdersFilters({
  searchParams,
  onParamsChange,
  groups,
  statuses,
  formats,
  types,
  onExport,
  exportLoading = false,
}: OrdersFiltersProps) {
  const [name, setName] = useState(searchParams.get('name') ?? '');
  const [surname, setSurname] = useState(searchParams.get('surname') ?? '');
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [phone, setPhone] = useState(searchParams.get('phone') ?? '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setName(searchParams.get('name') ?? '');
    setSurname(searchParams.get('surname') ?? '');
    setEmail(searchParams.get('email') ?? '');
    setPhone(searchParams.get('phone') ?? '');
  }, [searchParams]);

  const applyDebounced = (key: string, value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      next.set('page', '1');
      if (value) next.set(key, value);
      else next.delete(key);
      onParamsChange(Object.fromEntries(next));
      timerRef.current = null;
    }, DEBOUNCE_MS);
  };

  const handleNameChange = (v: string) => {
    setName(v);
    applyDebounced('name', v);
  };
  const handleSurnameChange = (v: string) => {
    setSurname(v);
    applyDebounced('surname', v);
  };
  const handleEmailChange = (v: string) => {
    setEmail(v);
    applyDebounced('email', v);
  };
  const handlePhoneChange = (v: string) => {
    setPhone(v);
    applyDebounced('phone', v);
  };

  const myOrders = searchParams.get('my_orders') === 'true';
  const statusId = searchParams.get('status_id') ?? '';
  const formatId = searchParams.get('format_id') ?? '';
  const typeId = searchParams.get('type_id') ?? '';
  const groupId = searchParams.get('group_id') ?? '';

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set('page', '1');
    if (value) next.set(key, value);
    else next.delete(key);
    onParamsChange(Object.fromEntries(next));
  };

  const resetFilters = () => {
    onParamsChange({ page: '1' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Name"
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900 placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Surname</label>
          <input
            type="text"
            value={surname}
            onChange={(e) => handleSurnameChange(e.target.value)}
            placeholder="Surname"
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900 placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="Email"
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900 placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="Phone"
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900 placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Format</label>
          <select
            value={formatId}
            onChange={(e) => setParam('format_id', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900"
          >
            <option value="">All formats</option>
            {formats.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select
            value={typeId}
            onChange={(e) => setParam('type_id', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900"
          >
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            value={statusId}
            onChange={(e) => setParam('status_id', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900"
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Group</label>
          <select
            value={groupId}
            onChange={(e) => setParam('group_id', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900"
          >
            <option value="">All groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={myOrders}
              onChange={(e) => setParam('my_orders', e.target.checked ? 'true' : '')}
              className="rounded border-gray-300 text-green-500"
            />
            <span className="text-sm">My</span>
          </label>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={resetFilters}
            className="px-3 py-1.5 border border-green-500 text-green-500 rounded text-sm hover:bg-green-50"
            title="Reset filters"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="px-3 py-1.5 border border-red-500 text-red-500 rounded text-sm hover:bg-red-50"
            title="Clear all filters"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={exportLoading}
            className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
          >
            {exportLoading ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}
