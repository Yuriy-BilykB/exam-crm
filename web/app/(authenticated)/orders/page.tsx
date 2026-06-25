'use client';

import OrdersContainer from './OrdersContainer';
import { useOrdersList } from '@/hooks/orders/useOrdersList';
import { useOrderSearchParams } from '@/hooks/useOrderSearchParams';

export default function OrdersPage() {
  const { params, setParams, listParams } = useOrderSearchParams();

  const { data, isError, isPending } = useOrdersList(listParams);

  const handleSort = (column: string) => {
    if (params.sortBy === column) {
      setParams({
        sortOrder: params.sortOrder === 'ASC' ? 'DESC' : 'ASC',
        page: 1,
      });
    } else {
      setParams({ sortBy: column, sortOrder: 'DESC', page: 1 });
    }
  };

  const handlePageChange = (page: number) => {
    setParams({ page });
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Loading orders...</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-8 text-gray-500">No orders found</div>
    );
  }

  return (
    <OrdersContainer
      data={{ orders: data.data, total: data.total }}
      currentPage={params.page}
      sortBy={params.sortBy}
      sortOrder={params.sortOrder}
      onSort={handleSort}
      onPageChange={handlePageChange}
    />
  );
}
