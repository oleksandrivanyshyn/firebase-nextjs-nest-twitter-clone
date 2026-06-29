'use client';

import { FcGoogle } from 'react-icons/fc';
import { useSignInWithGoogle } from '@/hooks/useAuth';

export function GoogleSignInButton() {
  const { mutate, isPending, error } = useSignInWithGoogle();

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-red-400">{error.message}</p>
      )}
      <button
        type="button"
        onClick={() => mutate()}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-700 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800 disabled:opacity-50"
      >
        <FcGoogle className="h-5 w-5" />
        {isPending ? 'Connecting…' : 'Continue with Google'}
      </button>
    </div>
  );
}
