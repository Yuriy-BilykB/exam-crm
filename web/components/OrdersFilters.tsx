'use client';

import type { Group, Status, CourseFormat, CourseType } from '@/lib/api/reference.service';
import { useOrderSearchParams } from '@/hooks/useOrderSearchParams';

interface OrdersFiltersProps {
  groups: Group[];
  statuses: Status[];
  formats: CourseFormat[];
  types: CourseType[];
  onExport?: () => void;
  exportLoading?: boolean;
}

export default function OrdersFilters({
  groups,
  statuses,
  formats,
  types,
  onExport,
  exportLoading = false,
}: OrdersFiltersProps) {
  const { params, setParams, resetFilters } = useOrderSearchParams();

  const setFilter = (patch: Parameters<typeof setParams>[0]) => {
    setParams({ page: 1, ...patch });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input
            type="text"
            value={params.name}
            onChange={(e) => setFilter({ name: e.target.value })}
            placeholder="Name"
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900 placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Surname</label>
          <input
            type="text"
            value={params.surname}
            onChange={(e) => setFilter({ surname: e.target.value })}
            placeholder="Surname"
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900 placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input
            type="text"
            value={params.email}
            onChange={(e) => setFilter({ email: e.target.value })}
            placeholder="Email"
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900 placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
          <input
            type="text"
            value={params.phone}
            onChange={(e) => setFilter({ phone: e.target.value })}
            placeholder="Phone"
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900 placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Format</label>
          <select
            value={params.format_id}
            onChange={(e) => setFilter({ format_id: e.target.value })}
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
            value={params.type_id}
            onChange={(e) => setFilter({ type_id: e.target.value })}
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
            value={params.status_id}
            onChange={(e) => setFilter({ status_id: e.target.value })}
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
            value={params.group_id}
            onChange={(e) => setFilter({ group_id: e.target.value })}
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
              checked={params.my_orders}
              onChange={(e) => setFilter({ my_orders: e.target.checked })}
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
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              disabled={exportLoading}
              className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
            >
              {exportLoading ? 'Exporting...' : 'Export Excel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
