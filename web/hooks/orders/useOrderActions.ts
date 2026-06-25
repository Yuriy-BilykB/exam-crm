import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { orderKeys } from '@/lib/query/orders.keys';

/**
 * Write actions on a single order (comment, edit). Both refresh the affected
 * order detail and the lists, so the UI stays in sync without manual refetching.
 */
export function useOrderActions() {
  const queryClient = useQueryClient();

  const addComment = useMutation({
    mutationFn: ({ orderId, comment }: { orderId: number; comment: string }) =>
      ordersService.addComment(orderId, comment),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });

  const updateOrder = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      ordersService.updateOrder(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(orderKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });

  return { addComment, updateOrder };
}
