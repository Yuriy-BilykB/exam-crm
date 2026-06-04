'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/api/auth.service';
import Pagination from '@/components/Pagination';
import OrderRow from '@/components/OrderRow';
import EditOrderModal from '@/components/EditOrderModal';
import OrdersFilters from '@/components/OrdersFilters';
import ordersService, { type OrderListItem, type OrderDetail, type OrderListParams } from '@/services/orders.service';
import referenceService from '@/lib/api/reference.service';
import type { Group, Status, CourseFormat, CourseType } from '@/lib/api/reference.service';

const LIMIT = 25;
const columns = [
  { key: 'id', label: 'id' },
  { key: 'name', label: 'name' },
  { key: 'surname', label: 'surname' },
  { key: 'email', label: 'email' },
  { key: 'phone', label: 'phone' },
  { key: 'age', label: 'age' },
  { key: 'course', label: 'course' },
  { key: 'course_format', label: 'course_format' },
  { key: 'course_type', label: 'course_type' },
  { key: 'status', label: 'status' },
  { key: 'sum', label: 'sum' },
  { key: 'alreadyPaid', label: 'alreadyPaid' },
  { key: 'manager', label: 'manager' },
  { key: 'group', label: 'group' },
  { key: 'created_at', label: 'created_at' },
];

type SortOrder = 'ASC' | 'DESC';

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [editOrder, setEditOrder] = useState<OrderDetail | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [formats, setFormats] = useState<CourseFormat[]>([]);
  const [types, setTypes] = useState<CourseType[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  const currentPage = Number(searchParams.get('page')) || 1;
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = (searchParams.get('sortOrder') as SortOrder) || 'DESC';
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const buildListParams = useCallback((): OrderListParams => {
    const params: OrderListParams = {
      page: currentPage,
      limit: LIMIT,
      sortBy,
      sortOrder,
    };
    const name = searchParams.get('name');
    const surname = searchParams.get('surname');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const myOrders = searchParams.get('my_orders');
    const statusId = searchParams.get('status_id');
    const formatId = searchParams.get('format_id');
    const typeId = searchParams.get('type_id');
    const groupId = searchParams.get('group_id');
    if (name) params.name = name;
    if (surname) params.surname = surname;
    if (email) params.email = email;
    if (phone) params.phone = phone;
    if (myOrders === 'true') params.my_orders = true;
    if (statusId) params.status_id = statusId;
    if (formatId) params.format_id = formatId;
    if (typeId) params.type_id = typeId;
    if (groupId) params.group_id = groupId;
    return params;
  }, [currentPage, sortBy, sortOrder, searchParams]);

  const updateUrlParams = useCallback(
    (params: Record<string, string> | { page?: number; sortBy?: string; sortOrder?: SortOrder }) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') newParams.set(k, String(v));
        else newParams.delete(k);
      });
      router.push(`/orders?${newParams.toString()}`);
    },
    [router, searchParams]
  );

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = buildListParams();
      const response = await ordersService.getOrders(params);
      setOrders(response.data);
      setTotal(response.total);
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } })?.response?.status === 401) {
        authService.logout();
        router.push('/login');
        return;
      }
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load orders'
      );
    } finally {
      setLoading(false);
    }
  }, [buildListParams, router]);

  useEffect(() => {
    Promise.all([
      referenceService.getGroups(),
      referenceService.getStatuses(),
      referenceService.getCourseFormats(),
      referenceService.getCourseTypes(),
    ]).then(([g, s, f, t]) => {
      setGroups(g);
      setStatuses(s);
      setFormats(f);
      setTypes(t);
    });
  }, []);

  const handleExportExcel = useCallback(async () => {
    setExportLoading(true);
    try {
      const params = buildListParams();
      const blob = await ordersService.exportExcel(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed');
    } finally {
      setExportLoading(false);
    }
  }, [buildListParams]);

  useEffect(() => {
    if (!authService.getStoredToken()) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [fetchOrders, router]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      updateUrlParams({ sortOrder: sortOrder === 'ASC' ? 'DESC' : 'ASC', page: '1' });
    } else {
      updateUrlParams({ sortBy: column, sortOrder: 'DESC', page: '1' });
    }
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ ...Object.fromEntries(searchParams.entries()), page: String(page) });
  };

  const handleFiltersChange = (params: Record<string, string>) => {
    router.push(`/orders?${new URLSearchParams(params).toString()}`);
  };

  const handleOrderUpdated = (updated: OrderListItem) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
  };

  const handleEditClick = (order: OrderListItem, detail: OrderDetail) => {
    setEditOrder(detail);
  };

  const handleEditSaved = (updated: OrderDetail) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
    );
    setEditOrder(null);
  };

  const user = authService.getStoredUser();

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'ASC' ? ' ▲' : ' ▼';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-500 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">CRM</span>
          <h1 className="text-xl font-semibold">Orders</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">{user?.name ?? user?.email}</span>
          {user?.role === 'admin' && (
            <a
              href="/admin"
              className="bg-white text-green-500 px-4 py-2 rounded hover:bg-gray-100 transition-colors text-sm"
            >
              Admin
            </a>
          )}
          <button
            onClick={() => {
              authService.logout();
              router.push('/login');
            }}
            className="bg-white text-green-500 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <OrdersFilters
          searchParams={searchParams}
          onParamsChange={handleFiltersChange}
          groups={groups}
          statuses={statuses}
          formats={formats}
          types={types}
          onExport={handleExportExcel}
          exportLoading={exportLoading}
        />

        <div className="mb-4 text-gray-600">
          Total orders: {total}
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-500 text-white">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-3 text-left cursor-pointer hover:bg-green-600 transition-colors whitespace-nowrap"
                  >
                    {col.label}
                    {renderSortIcon(col.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onOrderUpdated={handleOrderUpdated}
                  onEditClick={handleEditClick}
                />
              ))}
            </tbody>
          </table>
          {orders.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">No orders found</div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>
      {editOrder && (
        <EditOrderModal
          order={editOrder}
          onClose={() => setEditOrder(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}
