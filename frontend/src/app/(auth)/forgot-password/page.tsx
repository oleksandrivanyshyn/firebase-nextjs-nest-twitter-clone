'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSendPasswordReset } from '@/hooks/useAuth';
import { AuthCard } from '@/components/auth/AuthCard';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const {
    mutate: sendReset,
    isPending,
    isSuccess,
    error,
  } = useSendPasswordReset();

  return (
    <AuthCard title="Reset Password">
      {isSuccess ? (
        <div className="rounded-lg bg-green-900/40 p-4 text-center text-green-300">
          Check your email for a reset link.
          <div className="mt-3">
            <Link href="/login" className="text-blue-400 hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <p className="rounded-lg bg-red-900/40 p-3 text-sm text-red-300">
              {error.message}
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendReset(email);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {isPending ? 'Sending…' : 'Send Reset Email'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500">
            <Link href="/login" className="text-blue-400 hover:underline">
              Back to login
            </Link>
          </p>
        </>
      )}
    </AuthCard>
  );
}
