import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import adminService, { type ActionLinkResult } from '@/lib/api/admin.service';
import { adminKeys } from '@/lib/query/admin.keys';

const LIMIT = 25;

/** Copy the activation/recovery link and tell the admin what happened. */
async function shareActionLink({ link, emailSent }: ActionLinkResult) {
  const copied = await navigator.clipboard
    .writeText(link)
    .then(() => true)
    .catch(() => false);

  if (emailSent && copied) toast.success('Email sent and link copied');
  else if (emailSent) toast.success('Email sent');
  else if (copied) toast.success('Link copied');
  else toast.error('Could not copy link');
}

/**
 * Everything the admin screen needs for the managers list: the paginated query
 * plus all row actions, exposed as flat handlers so the component never touches
 * react-query directly.
 */
export function useAdminManagers(page: number, enabled = true) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminKeys.all });

  const query = useQuery({
    queryKey: adminKeys.managers(page),
    queryFn: () => adminService.getManagers(page, LIMIT),
    enabled,
    placeholderData: keepPreviousData,
  });

  const create = useMutation({ mutationFn: adminService.createManager, onSuccess: invalidate });
  const activate = useMutation({ mutationFn: adminService.activateManager, onSuccess: shareActionLink });
  const recovery = useMutation({ mutationFn: adminService.recoveryPassword, onSuccess: shareActionLink });
  const ban = useMutation({ mutationFn: adminService.banUser, onSuccess: invalidate });
  const unban = useMutation({ mutationFn: adminService.unbanUser, onSuccess: invalidate });

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
