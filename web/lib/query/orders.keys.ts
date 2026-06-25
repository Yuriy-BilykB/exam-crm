import type { OrderListParams } from '@/services/orders.service';

export const orderKeys = {
  all: ['orders'] as const,
  list: (params: OrderListParams) => [...orderKeys.all, 'list', params] as const,
  detail: (id: number) => [...orderKeys.all, 'detail', id] as const,
};
