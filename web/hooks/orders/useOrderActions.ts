import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import type { OrdersResponse } from '@/services/orders.service';
import { orderKeys } from '@/lib/query/orders.keys';
import { adminKeys } from '@/lib/query/admin.keys';

export function useOrderActions() {
  const queryClient = useQueryClient();

  const addComment = useMutation({
    mutationFn: ({ orderId, comment }: { orderId: number; comment: string }) =>
      ordersService.addComment(orderId, comment),
    onSuccess: async (_data, { orderId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) }),
        queryClient.invalidateQueries({ queryKey: orderKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminKeys.all, refetchType: 'all' }),
      ]);
    },
  });

  const updateOrder = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      ordersService.updateOrder(id, data),
    onSuccess: async (updated) => {
      queryClient.setQueryData(orderKeys.detail(updated.id), updated);
      queryClient.setQueriesData<OrdersResponse>(
        { queryKey: [...orderKeys.all, 'list'] },
        (previous) => previous && ({
          ...previous,
          data: previous.data.map((order) =>
            order.id === updated.id ? { ...order, ...updated } : order,
          ),
        }),
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: orderKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: adminKeys.all,
          refetchType: 'all',
        }),
      ]);
    },
  });

  return { addComment, updateOrder };
}
