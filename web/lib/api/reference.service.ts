import { api } from './client';

export interface Group { id: number; name: string; }

const referenceService = {
  async getGroups(): Promise<Group[]> {
    const { data } = await api.get<Group[]>('/groups');
    return data;
  },
  async createGroup(name: string): Promise<Group> {
    const { data } = await api.post<Group>('/groups', { name });
    return data;
  },
};

export default referenceService;
