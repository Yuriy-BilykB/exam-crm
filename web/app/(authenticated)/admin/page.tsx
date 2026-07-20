'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useAdminStats } from '@/hooks/admin/useAdminStats';
import { useAdminManagers } from '@/hooks/admin/useAdminManagers';
import CreateManagerModal from '@/components/CreateManagerModal';
import ManagerCard from '@/components/ManagerCard';
import Pagination from '@/components/Pagination';
import { useToggleState } from '@/hooks/useToggler';
import { statusLabel } from '@/lib/reference/lists';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [createModalOpen, openCreateModal, closeCreateModal] = useToggleState(false);
  const [page, setPage] = useState(1);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (user && !isAdmin) {router.replace('/orders');}
  }, [user, isAdmin, router]);

  const { data: stats = [] } = useAdminStats(isAdmin);

  const { managers, isLoading, pageCount, createManager, activate, recovery, ban, unban } =
    useAdminManagers(page, isAdmin);

  if (!user || !isAdmin) {
    return <div className="text-gray-500">Access denied</div>;
  }

  const totalOrders = stats.reduce((acc, s) => acc + s.count, 0);

  return (
    <>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Orders statistic</h2>
        <p className="text-gray-600">
          total: {totalOrders}
          {stats.map((s) => (
            <span key={s.statusName} className="ml-3">
              {statusLabel(s.statusName)}: {s.count}
            </span>
          ))}
        </p>
      </div>

      <button
        onClick={openCreateModal}
        className="mb-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        CREATE
      </button>

      {isLoading && managers.length === 0 ? (
        <p className="text-gray-500">Loading managers...</p>
      ) : (
        <div className="space-y-4">
          {managers.map((manager) => (
            <ManagerCard
              key={manager.id}
              manager={manager}
              onActivate={activate}
              onRecovery={recovery}
              onBan={ban}
              onUnban={unban}
            />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pageCount}
          onPageChange={setPage}
        />
      )}

      {createModalOpen && (
        <CreateManagerModal
          onClose={closeCreateModal}
          onCreate={createManager}
        />
      )}
    </>
  );
}
