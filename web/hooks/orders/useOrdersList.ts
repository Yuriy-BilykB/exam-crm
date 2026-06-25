import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ordersService, type OrderListParams } from '@/services/orders.service';
import { orderKeys } from '@/lib/query/orders.keys';

export function useOrdersList(params: OrderListParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersService.getOrders(params),
    placeholderData: keepPreviousData,
  });
}
