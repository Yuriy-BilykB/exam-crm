import { api } from '@/lib/api/client';

export interface Order {
  id: number;
  name: string | null;
  surname: string | null;
  email: string | null;
  phone: string | null;
  age: number | null;
  course?: { id: number; code: string } | null;
  format?: { id: number; name: string } | null;
  type?: { id: number; name: string } | null;
  status?: { id: number; name: string } | null;
  manager?: { id: number; name: string | null } | null;
  group?: { id: number; name: string } | null;
  sum: number | null;
  alreadyPaid: number | null;
  utm: string | null;
  message: string | null;
  created_at: string | null;
}

export interface CommentItem {
  id: number;
  orderId: number;
  userId: number;
  comment: string | null;
  createdAt: string;
  user?: { id: number; name: string | null; email: string };
}

export interface OrderDetail extends Order {
  comments?: CommentItem[];
}

export type OrderListParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  my_orders?: boolean;
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  status_id?: string;
  course_id?: string;
  format_id?: string;
  type_id?: string;
  manager_id?: string;
  group_id?: string;
};

export interface OrdersResponse {
  data: Order[];
  total: number;
}

export const ordersService = {
  async getOrders(params: OrderListParams): Promise<OrdersResponse> {
    const response = await api.get<OrdersResponse>('/orders', { params });
    return response.data;
  },

  async getOrder(id: number): Promise<OrderDetail> {
    const response = await api.get<OrderDetail>(`/orders/${id}`);
    return response.data;
  },

  async getComments(orderId: number): Promise<CommentItem[]> {
    const response = await api.get<CommentItem[]>(`/orders/${orderId}/comments`);
    return response.data;
  },

  async addComment(orderId: number, comment: string): Promise<CommentItem> {
    const response = await api.post<CommentItem>(`/orders/${orderId}/comments`, { comment });
    return response.data;
  },

  async updateOrder(id: number, data: Record<string, unknown>): Promise<OrderDetail> {
    const response = await api.patch<OrderDetail>(`/orders/${id}`, data);
    return response.data;
  },

  async exportExcel(params: OrderListParams): Promise<Blob> {
    const response = await api.get<Blob>('/orders/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
