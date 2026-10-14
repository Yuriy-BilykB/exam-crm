import { useQuery } from '@tanstack/react-query';
import adminService from '@/lib/api/admin.service';
import { adminKeys } from '@/lib/query/admin.keys';

export function useManagerStats(managerId: string) {
  return useQuery({
    queryKey: adminKeys.managerStats(managerId),
    queryFn: () => adminService.getManagerStats(managerId),
  });
}
