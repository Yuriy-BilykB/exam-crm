import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import adminService, {
  type ActionLinkResult,
  type ManagerUser,
  type ManagersResponse,
} from '@/lib/api/admin.service';
import { adminKeys } from '@/lib/query/admin.keys';

const LIMIT = 25;

async function shareActionLink({ link }: ActionLinkResult) {
  const copied = await navigator.clipboard
    .writeText(link)
    .then(() => true)
    .catch(() => false);

  // Email sending temporarily disabled — the link is only copied to clipboard.
  // if (emailSent && copied) {toast.success('Email sent and link copied');}
  // else if (emailSent) {toast.success('Email sent');}
  if (copied) {toast.success('Link copied');}
  else {toast.error('Could not copy link');}
}

export function useAdminManagers(page: number, enabled = true) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminKeys.all });

  const patchManager = (updated: ManagerUser) => {
    queryClient.setQueriesData<ManagersResponse>(
      { queryKey: [...adminKeys.all, 'managers'] },
      (prev) => {
        if (!prev) {return prev;}
        return {
          ...prev,
          data: prev.data.map((m) => (m.id === updated.id ? updated : m)),
        };
      },
    );
  };

  const query = useQuery({
    queryKey: adminKeys.managers(page),
    queryFn: () => adminService.getManagers(page, LIMIT),
    enabled,
    placeholderData: keepPreviousData,
  });

  const create = useMutation({
    mutationFn: adminService.createManager,
    onSuccess: () => {
      invalidate();
      toast.success('Manager created');
    },
    onError: () => toast.error('Could not create manager'),
  });
  const activate = useMutation({ mutationFn: adminService.activateManager, onSuccess: shareActionLink });
  const recovery = useMutation({ mutationFn: adminService.recoveryPassword, onSuccess: shareActionLink });
  const ban = useMutation({
    mutationFn: adminService.banUser,
    onSuccess: (user) => {
      patchManager(user);
      toast.success(`${user.email} banned`);
    },
    onError: () => toast.error('Could not ban manager'),
  });
  const unban = useMutation({
    mutationFn: adminService.unbanUser,
    onSuccess: (user) => {
      patchManager(user);
      toast.success(`${user.email} unbanned`);
    },
    onError: () => toast.error('Could not unban manager'),
  });

  const total = query.data?.total ?? 0;

  return {
    managers: query.data?.data ?? [],
    total,
    pageCount: Math.max(1, Math.ceil(total / LIMIT)),
    isLoading: query.isPending,

    createManager: create.mutateAsync,
    activate: activate.mutate,
    recovery: recovery.mutate,
    ban: ban.mutate,
    unban: unban.mutate,
  };
}
