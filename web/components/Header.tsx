'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { ManagersIcon, OrdersIcon, LogoutIcon } from './icons';

const PAGE_TITLES: Record<string, string> = {
  '/orders': 'Orders',
  '/admin': 'Admin',
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const title =
    Object.entries(PAGE_TITLES).find(([href]) => pathname?.startsWith(href))?.[1] ?? '';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isAdmin = user?.role === 'admin';

  const navLinks = isAdmin
    ? [
        { href: '/orders', label: 'Orders' },
        { href: '/admin', label: 'Admin' },
      ]
    : [];

  return (
    <header className="bg-green-500 text-white px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold">CRM</span>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm">{user?.name ?? user?.email}</span>
        {navLinks
          .filter((link) => !pathname?.startsWith(link.href))
          .map((link) => (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              aria-label={link.label}
              className="bg-green-600 hover:bg-green-700 p-2 rounded flex items-center justify-center"
            >
              {link.href === '/admin' ? <ManagersIcon /> : <OrdersIcon />}
            </Link>
          ))}
        <button
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          className="bg-green-600 hover:bg-green-700 p-2 rounded flex items-center justify-center"
        >
          <LogoutIcon />
        </button>
      </div>
    </header>
  );
}
