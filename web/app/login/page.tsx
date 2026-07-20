'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'authenticated') {router.replace('/orders');}
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-500">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
