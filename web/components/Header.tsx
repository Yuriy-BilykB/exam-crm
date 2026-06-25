'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

export default function Header({ title }: { title: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const onAdmin = pathname?.startsWith('/admin');

  return (
    <header className="bg-green-500 text-white px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold">CRM</span>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {onAdmin ? (
          <Link href="/orders" className="bg-white text-green-500 px-4 py-2 rounded hover:bg-gray-100">
            Orders
          </Link>
        ) : (
          user?.role === 'admin' && (
            <Link href="/admin" className="bg-white text-green-500 px-4 py-2 rounded hover:bg-gray-100">
              Admin
            </Link>
          )
        )}
        <span className="text-sm">{user?.name ?? user?.email}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-green-500 px-4 py-2 rounded hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
