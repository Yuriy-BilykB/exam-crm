'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';

export default function ActivatePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/set-password', { token, password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Invalid or expired link'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-500">
        <div className="bg-gray-100 rounded-lg p-6 text-gray-700">Invalid link</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-500">
        <div className="bg-gray-100 rounded-lg p-6 text-gray-700">
          Account activated. Redirecting to login...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-500">
      <div className="bg-gray-100 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Set password</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm Password"
              className="w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 placeholder-gray-500"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-500 text-white font-semibold rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : 'ACTIVATE'}
          </button>
        </form>
      </div>
    </div>
  );
}
