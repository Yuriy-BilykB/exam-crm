'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Pagination from '@/components/Pagination';
import OrderRow from '@/components/OrderRow';
import EditOrderModal from '@/components/EditOrderModal';
import OrdersFilters from '@/components/OrdersFilters';
import type { Order, OrderDetail } from '@/services/orders.service';
import {
  useGroups,
  useStatuses,
  useCourseFormats,
  useCourseTypes,
} from '@/hooks/reference/useReferences';
import type { SortOrder } from '@/lib/orders-search-params';
import { ORDERS_PAGE_LIMIT } from '@/lib/orders-search-params';
import { useToggleState } from '@/hooks/useToggler';

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

type OrdersData = {
  orders: Order[];
  total: number;
};

export type Props = {
  data: OrdersData;
  currentPage: number;
  sortBy: string;
  sortOrder: SortOrder;
  onSort: (column: string) => void;
  onPageChange: (page: number) => void;
};

export default function OrdersContainer({
  data,
  currentPage,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
}: Props) {
  const { data: groups = [] } = useGroups();
  const { data: statuses = [] } = useStatuses();
  const { data: formats = [] } = useCourseFormats();
  const { data: types = [] } = useCourseTypes();

  const [isModalOpen, openModal, closeModal] = useToggleState(false);
  const [editOrder, setEditOrder] = useState<OrderDetail | null>(null);

  const handleEditClick = (_order: Order, detail: OrderDetail) => {
    setEditOrder(detail);
    openModal();
  };

  const handleEditClose = () => {
    closeModal();
    setEditOrder(null);
  };

  // The edit mutation invalidates the order lists itself, so we only close here.
  const handleEditSaved = handleEditClose;

  const { orders, total } = data;

  const totalPages = Math.max(1, Math.ceil(total / ORDERS_PAGE_LIMIT));

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'ASC' ? ' ▲' : ' ▼';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Orders" />

      <main className="p-6">
        <OrdersFilters
          groups={groups}
          statuses={statuses}
          formats={formats}
          types={types}
          // onExport={onExport}
          // exportLoading={exportLoading}
        />

        <div className="mb-4 text-gray-600">Total orders: {total}</div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-500 text-white">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => onSort(col.key)}
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
                  onEditClick={handleEditClick}
                />
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </main>

      {isModalOpen && editOrder && (
        <EditOrderModal order={editOrder} onClose={handleEditClose} onSaved={handleEditSaved} />
      )}
    </div>
  );
}
