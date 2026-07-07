'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSendPasswordReset } from '@/hooks/useAuth';
import { AuthCard } from '@/components/auth/AuthCard';
import { Button } from '@/components/ui/button';

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
              <label className="block text-sm font-medium text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-500"
            >
              {isPending ? 'Sending…' : 'Send Reset Email'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-blue-400 hover:underline">
              Back to login
            </Link>
          </p>
        </>
      )}
    </AuthCard>
  );
}
