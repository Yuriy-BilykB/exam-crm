'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import type { ManagerUser } from '@/lib/api/admin.service';
import { useAdminStats } from '@/hooks/admin/useAdminStats';
import { useAdminManagers } from '@/hooks/admin/useAdminManagers';
import { useManagerStats } from '@/hooks/admin/useManagerStats';
import Header from '@/components/Header';
import CreateManagerModal from '@/components/CreateManagerModal';
import Pagination from '@/components/Pagination';
import { useToggleState } from '@/hooks/useToggler';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [createModalOpen, openCreateModal, closeCreateModal] = useToggleState(false);
  const [page, setPage] = useState(1);

  const isAdmin = user?.role === 'admin';

  // Managers (role 'manager') get bounced to their orders page.
  useEffect(() => {
    if (user && !isAdmin) router.replace('/orders');
  }, [user, isAdmin, router]);

  const { data: stats = [] } = useAdminStats(isAdmin);
  const { managers, isLoading, pageCount, createManager, activate, recovery, ban, unban } =
    useAdminManagers(page, isAdmin);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Access denied</div>
      </div>
    );
  }

  const totalOrders = stats.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Admin" />

      <main className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Orders statistic</h2>
          <p className="text-gray-600">
            total: {totalOrders}
            {stats.map((s) => (
              <span key={s.statusName} className="ml-3">
                {s.statusName}: {s.count}
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
            {managers.map((m) => (
              <ManagerCard
                key={m.id}
                manager={m}
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
      </main>

      {createModalOpen && (
        <CreateManagerModal
          onClose={closeCreateModal}
          onCreate={createManager}
        />
      )}
    </div>
  );
}

function ManagerCard({
  manager,
  onActivate,
  onRecovery,
  onBan,
  onUnban,
}: {
  manager: ManagerUser;
  onActivate: (id: number) => void;
  onRecovery: (id: number) => void;
  onBan: (id: number) => void;
  onUnban: (id: number) => void;
}) {
  const { data: stats = [] } = useManagerStats(manager.id);
  const total = stats.reduce((acc, s) => acc + s.count, 0);

  const handleActivate = useCallback(() => onActivate(manager.id), [onActivate, manager.id]);
  const handleRecovery = useCallback(() => onRecovery(manager.id), [onRecovery, manager.id]);
  const handleBan = useCallback(() => onBan(manager.id), [onBan, manager.id]);
  const handleUnban = useCallback(() => onUnban(manager.id), [onUnban, manager.id]);

  return (
    <div className="bg-white rounded-lg border border-green-200 p-4 flex flex-wrap justify-between items-start gap-4">
      <div className="text-sm text-gray-700 space-y-1">
        <p>id: {manager.id}</p>
        <p>email: {manager.email}</p>
        <p>name: {manager.name ?? '—'}</p>
        <p>surname: {manager.surname ?? '—'}</p>
        <p>is_active: {String(manager.isActive)}</p>
        <p className="text-gray-500">
          total: {total}
          {stats.map((s) => (
            <span key={s.statusName}> {s.statusName}: {s.count}</span>
          ))}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {!manager.isActive && (
          <button
            onClick={handleActivate}
            className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            ACTIVATE
          </button>
        )}
        {manager.isActive && (
          <button
            onClick={handleRecovery}
            className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            RECOVERY PASSWORD
          </button>
        )}
        <button
          onClick={handleBan}
          className="px-3 py-1.5 border border-green-500 text-green-500 rounded text-sm hover:bg-green-50"
        >
          BAN
        </button>
        <button
          onClick={handleUnban}
          className="px-3 py-1.5 border border-green-500 text-green-500 rounded text-sm hover:bg-green-50"
        >
          UNBAN
        </button>
      </div>
    </div>
  );
}
