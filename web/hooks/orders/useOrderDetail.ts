import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { orderKeys } from '@/lib/query/orders.keys';

export function useOrderDetail(orderId: number, enabled = true) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => ordersService.getOrder(orderId),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
