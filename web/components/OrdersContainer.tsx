'use client';

import { useState } from 'react';
import Pagination from '@/components/Pagination';
import OrderRow from '@/components/OrderRow';
import EditOrderModal from '@/components/EditOrderModal';
import OrdersFilters from '@/components/OrdersFilters';
import type { Order, OrderDetail, OrdersResponse } from '@/services/orders.service';
import { useGroups } from '@/hooks/reference/useReferences';
import { ORDERS_PAGE_LIMIT } from '@/lib/orders-search-params';
import type { useOrderSearchParams } from '@/hooks/useOrderSearchParams';
import { useToggleState } from '@/hooks/useToggler';

const columns = [
  { key: 'id', label: 'id' },
  { key: 'name', label: 'name' },
  { key: 'surname', label: 'surname' },
  { key: 'email', label: 'email' },
  { key: 'phone', label: 'phone' },
  { key: 'age', label: 'age' },
  { key: 'course', label: 'course' },
  { key: 'courseFormat', label: 'course_format' },
  { key: 'courseType', label: 'course_type' },
  { key: 'status', label: 'status' },
  { key: 'sum', label: 'sum' },
  { key: 'alreadyPaid', label: 'alreadyPaid' },
  { key: 'manager', label: 'manager' },
  { key: 'group', label: 'group' },
  { key: 'createdAt', label: 'created_at' },
];

export type Props = {
  data: OrdersResponse;
  params: ReturnType<typeof useOrderSearchParams>['params'];
  setParams: ReturnType<typeof useOrderSearchParams>['setParams'];
};

export default function OrdersContainer({ data, params, setParams }: Props) {
  const { page: currentPage, sortBy, sortOrder } = params;
  const { data: orders, total } = data;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setParams({ sortOrder: sortOrder === 'ASC' ? 'DESC' : 'ASC', page: 1 });
    } else {
      setParams({ sortBy: column, sortOrder: 'DESC', page: 1 });
    }
  };

  const handlePageChange = (page: number) => {
    setParams({ page });
  };

  const { data: groups = [] } = useGroups();

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

  const handleEditSaved = handleEditClose;

  const totalPages = Math.max(1, Math.ceil(total / ORDERS_PAGE_LIMIT));

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {return null;}
    return sortOrder === 'ASC' ? ' ▲' : ' ▼';
  };

  return (
    <>
      <OrdersFilters
        groups={groups}
      />

      <div className="mb-4 text-gray-600">Total orders: {total}</div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-500 text-white">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left cursor-pointer select-none hover:bg-green-600 transition-colors whitespace-nowrap"
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
          onPageChange={handlePageChange}
        />
      )}

      {isModalOpen && editOrder && (
        <EditOrderModal order={editOrder} onClose={handleEditClose} onSaved={handleEditSaved} />
      )}
    </>
  );
}
