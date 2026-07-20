'use client';

import { toast } from 'sonner';
import type { Group } from '@/lib/api/reference.service';
import { useOrderSearchParams } from '@/hooks/useOrderSearchParams';
import { useExportOrders } from '@/hooks/orders/useExportOrders';
import { getApiErrorMessage } from '@/lib/api/errors';
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
import { ResetIcon, ExcelIcon } from './icons';

interface Props {
  groups: Group[];
}

export default function OrdersFilters({ groups }: Props) {
  const { params, setParams, listParams, resetFilters } = useOrderSearchParams();

  const setFilter = (patch: Parameters<typeof setParams>[0]) => {
    setParams({ page: 1, ...patch });
  };

  const exportOrders = useExportOrders();

  const handleExport = () => {
    exportOrders.mutate(listParams, {
      onError: (err) => toast.error(getApiErrorMessage(err, 'Could not export orders')),
    });
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
          <label className="block text-xs font-medium text-gray-600 mb-1">Age</label>
          <input
            type="number"
            min="0"
            value={params.age}
            onChange={(e) => setFilter({ age: e.target.value })}
            placeholder="Age"
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900 placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Course</label>
          <select
            value={params.course}
            onChange={(e) => setFilter({ course: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900"
          >
            <option value="">All courses</option>
            {CourseNameList.map((course) => (
              <option key={course} value={course}>{CourseNameLabels[course]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Format</label>
          <select
            value={params.format}
            onChange={(e) => setFilter({ format: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900"
          >
            <option value="">All formats</option>
            {CourseFormatList.map((format) => (
              <option key={format} value={format}>{CourseFormatLabels[format]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select
            value={params.type}
            onChange={(e) => setFilter({ type: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900"
          >
            <option value="">All types</option>
            {CourseTypeList.map((type) => (
              <option key={type} value={type}>{CourseTypeLabels[type]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            value={params.status}
            onChange={(e) => setFilter({ status: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900"
          >
            <option value="">All statuses</option>
            {OrderStatusList.map((status) => (
              <option key={status} value={status}>{OrderStatusLabels[status]}</option>
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
            {groups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Start date</label>
          <input
            type="date"
            value={params.startDate}
            onChange={(e) => setFilter({ startDate: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">End date</label>
          <input
            type="date"
            value={params.endDate}
            onChange={(e) => setFilter({ endDate: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-900"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={params.my_orders}
              onChange={(e) => setFilter({ my_orders: e.target.checked })}
              className="rounded border-gray-300 text-green-500"
            />
            <span className="text-sm text-gray-900">My</span>
          </label>
          <button
            type="button"
            onClick={resetFilters}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center"
            title="Reset filters"
            aria-label="Reset filters"
          >
            <ResetIcon />
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exportOrders.isPending}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center"
            title="Export Excel"
            aria-label="Export Excel"
          >
            <ExcelIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
