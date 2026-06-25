import { useQuery } from '@tanstack/react-query';
import adminService from '@/lib/api/admin.service';
import { adminKeys } from '@/lib/query/admin.keys';

export function useAdminStats(enabled = true) {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: adminService.getStats,
    enabled,
  });
}
