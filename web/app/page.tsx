'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/auth.service';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = authService.getStoredToken();
    if (token) {
      router.replace('/orders');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-gray-500">Redirecting...</div>
    </div>
  );
}
