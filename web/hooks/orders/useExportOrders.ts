import { useMutation } from '@tanstack/react-query';
import { ordersService, type OrderListParams } from '@/services/orders.service';

export function useExportOrders() {
  return useMutation({
    mutationFn: async (params: OrderListParams) => {
      const blob = await ordersService.exportExcel(params);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'orders.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
  });
}
