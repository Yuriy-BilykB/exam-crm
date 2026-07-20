'use client';

import { useCallback } from 'react';
import type { ManagerUser } from '@/lib/api/admin.service';
import { useManagerStats } from '@/hooks/admin/useManagerStats';
import { statusLabel } from '@/lib/reference/lists';
import { formatDate } from '@/lib/utils/dates';

type Props = {
  manager: ManagerUser;
  onActivate: (id: number) => void;
  onRecovery: (id: number) => void;
  onBan: (id: number) => void;
  onUnban: (id: number) => void;
};

export default function ManagerCard({
  manager,
  onActivate,
  onRecovery,
  onBan,
  onUnban,
}: Props) {
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
        <p>last_login: {formatDate(manager.lastLogin, 'null')}</p>
        <p className="text-gray-500">
          total: {total}
          {stats.map((s) => (
            <span key={s.statusName}> {statusLabel(s.statusName)}: {s.count}</span>
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
