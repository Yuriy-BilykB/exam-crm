'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/api/auth.service';
import adminService, { type ManagerUser, type OrderStatItem } from '@/lib/api/admin.service';
import CreateManagerModal from '@/components/CreateManagerModal';
import Pagination from '@/components/Pagination';

export default function AdminPage() {
  const router = useRouter();
  const user = authService.getStoredUser();
  const [stats, setStats] = useState<OrderStatItem[]>([]);
  const [managers, setManagers] = useState<ManagerUser[]>([]);
  const [totalManagers, setTotalManagers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 25;
  const totalPages = Math.max(1, Math.ceil(totalManagers / limit));

  const fetchStats = useCallback(async () => {
    const data = await adminService.getStats();
    setStats(data);
  }, []);

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getManagers(page, limit);
      setManagers(res.data);
      setTotalManagers(res.total);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!authService.getStoredToken()) {
      router.replace('/login');
      return;
    }
    if (user?.role !== 'admin') {
      router.replace('/orders');
      return;
    }
    fetchStats();
  }, [router, user?.role, fetchStats]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchManagers();
  }, [user?.role, fetchManagers]);

  const handleCreateManager = async (data: { email: string; name?: string }) => {
    await adminService.createManager(data);
    setCreateModalOpen(false);
    fetchManagers();
    fetchStats();
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    // could add toast
  };

  const handleActivate = async (id: number) => {
    const { link } = await adminService.activateManager(id);
    copyLink(link);
  };

  const handleRecovery = async (id: number) => {
    const { link } = await adminService.recoveryPassword(id);
    copyLink(link);
  };

  const handleBan = async (id: number) => {
    await adminService.banUser(id);
    fetchManagers();
  };

  const handleUnban = async (id: number) => {
    await adminService.unbanUser(id);
    fetchManagers();
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Access denied</div>
      </div>
    );
  }

  const totalOrders = stats.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-500 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">CRM</span>
          <h1 className="text-xl font-semibold">Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/orders" className="bg-white text-green-500 px-4 py-2 rounded hover:bg-gray-100">
            Orders
          </Link>
          <span className="text-sm">{user.name ?? user.email}</span>
          <button
            onClick={() => { authService.logout(); router.push('/login'); }}
            className="bg-white text-green-500 px-4 py-2 rounded hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>

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
          onClick={() => setCreateModalOpen(true)}
          className="mb-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          CREATE
        </button>

        {loading && managers.length === 0 ? (
          <p className="text-gray-500">Loading managers...</p>
        ) : (
          <div className="space-y-4">
            {managers.map((m) => (
              <ManagerCard
                key={m.id}
                manager={m}
                onActivate={handleActivate}
                onRecovery={handleRecovery}
                onBan={handleBan}
                onUnban={handleUnban}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </main>

      {createModalOpen && (
        <CreateManagerModal
          onClose={() => setCreateModalOpen(false)}
          onCreate={handleCreateManager}
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
  const [stats, setStats] = useState<OrderStatItem[]>([]);
  useEffect(() => {
    adminService.getManagerStats(manager.id).then(setStats);
  }, [manager.id]);
  const total = stats.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="bg-white rounded-lg border border-green-200 p-4 flex flex-wrap justify-between items-start gap-4">
      <div className="text-sm text-gray-700 space-y-1">
        <p>id: {manager.id}</p>
        <p>email: {manager.email}</p>
        <p>name: {manager.name ?? '—'}</p>
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
            onClick={() => onActivate(manager.id)}
            className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            ACTIVATE
          </button>
        )}
        {manager.isActive && (
          <button
            onClick={() => onRecovery(manager.id)}
            className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            RECOVERY PASSWORD
          </button>
        )}
        <button
          onClick={() => onBan(manager.id)}
          className="px-3 py-1.5 border border-green-500 text-green-500 rounded text-sm hover:bg-green-50"
        >
          BAN
        </button>
        <button
          onClick={() => onUnban(manager.id)}
          className="px-3 py-1.5 border border-green-500 text-green-500 rounded text-sm hover:bg-green-50"
        >
          UNBAN
        </button>
      </div>
    </div>
  );
}
