import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import referenceService, { type Group } from '@/lib/api/reference.service';
import { referenceKeys } from '@/lib/query/reference.keys';

// Reference data changes rarely — keep it fresh for 5 minutes.
const STALE_TIME = 1000 * 60 * 5;

export function useCourses() {
  return useQuery({
    queryKey: referenceKeys.courses(),
    queryFn: referenceService.getCourses,
    staleTime: STALE_TIME,
  });
}

export function useCourseFormats() {
  return useQuery({
    queryKey: referenceKeys.formats(),
    queryFn: referenceService.getCourseFormats,
    staleTime: STALE_TIME,
  });
}

export function useCourseTypes() {
  return useQuery({
    queryKey: referenceKeys.types(),
    queryFn: referenceService.getCourseTypes,
    staleTime: STALE_TIME,
  });
}

export function useStatuses() {
  return useQuery({
    queryKey: referenceKeys.statuses(),
    queryFn: referenceService.getStatuses,
    staleTime: STALE_TIME,
  });
}

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
