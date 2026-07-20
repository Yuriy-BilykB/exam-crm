import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import referenceService, { type Group } from '@/lib/api/reference.service';
import { referenceKeys } from '@/lib/query/reference.keys';

const STALE_TIME = 1000 * 60 * 5;

export function useGroups() {
  return useQuery({
    queryKey: referenceKeys.groups(),
    queryFn: referenceService.getGroups,
    staleTime: STALE_TIME,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: referenceService.createGroup,
    onSuccess: (group) => {
      queryClient.setQueryData<Group[]>(referenceKeys.groups(), (prev = []) => [
        ...prev,
        group,
      ]);
    },
  });
}
