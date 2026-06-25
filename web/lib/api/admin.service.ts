import { api } from './client';

export interface OrderStatItem {
  statusName: string;
  count: number;
}

export interface ManagerUser {
  id: number;
  email: string;
  name: string | null;
  surname: string | null;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
}

export interface ManagersResponse {
  data: ManagerUser[];
  total: number;
}

export interface CreateManagerBody {
  email: string;
  name?: string;
  surname?: string;
}

export interface ActionLinkResult {
  link: string;
  emailSent: boolean;
}

const adminService = {
  async getStats(): Promise<OrderStatItem[]> {
    const { data } = await api.get<OrderStatItem[]>('/admin/stats');
    return data;
  },
  async getManagers(page: number, limit: number): Promise<ManagersResponse> {
    const { data } = await api.get<ManagersResponse>('/admin/managers', {
      params: { page, limit },
    });
    return data;
  },
  async getManagerStats(managerId: number): Promise<OrderStatItem[]> {
    const { data } = await api.get<OrderStatItem[]>(`/admin/managers/${managerId}/stats`);
    return data;
  },
  async createManager(body: CreateManagerBody): Promise<ManagerUser> {
    const { data } = await api.post<ManagerUser>('/admin/managers', body);
    return data;
  },
  async activateManager(id: number): Promise<ActionLinkResult> {
    const { data } = await api.post<ActionLinkResult>(`/admin/managers/${id}/activate`);
    return data;
  },
  async recoveryPassword(id: number): Promise<ActionLinkResult> {
    const { data } = await api.post<ActionLinkResult>(`/admin/managers/${id}/recovery`);
    return data;
  },
  async banUser(id: number): Promise<ManagerUser> {
    const { data } = await api.post<ManagerUser>(`/admin/managers/${id}/ban`);
    return data;
  },
  async unbanUser(id: number): Promise<ManagerUser> {
    const { data } = await api.post<ManagerUser>(`/admin/managers/${id}/unban`);
    return data;
  },
};

export default adminService;
