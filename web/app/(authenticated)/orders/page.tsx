'use client';

import OrdersContainer from '@/components/OrdersContainer';
import { useOrdersList } from '@/hooks/orders/useOrdersList';
import { useOrderSearchParams } from '@/hooks/useOrderSearchParams';

export default function OrdersPage() {
  const { params, setParams, listParams } = useOrderSearchParams();

  const { data, isError, isPending } = useOrdersList(listParams);

  if (isPending) {
    return <div className="text-gray-600">Loading orders...</div>;
  }

  if (isError || !data) {
    return <div className="text-gray-500">No orders found</div>;
  }

  return (
    <OrdersContainer data={data} params={params} setParams={setParams} />
  );
}
