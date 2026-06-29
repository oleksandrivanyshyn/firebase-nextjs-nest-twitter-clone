'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useSignIn } from '@/hooks/useAuth';
import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { PhoneSignIn } from '@/components/auth/PhoneSignIn';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const {
    mutate: signIn,
    isPending: isSigningIn,
    error: signInError,
  } = useSignIn();

  return (
    <AuthCard title="Sign In">
      {signInError && (
        <p className="rounded-lg bg-red-900/40 p-3 text-sm text-red-300">
          {signInError.message}
        </p>
      )}
      <form
        onSubmit={handleSubmit((data) => signIn(data))}
        className="space-y-4"
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <input
            {...register('password')}
            id="password"
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSigningIn}
          className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          {isSigningIn ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      <GoogleSignInButton />
      <PhoneSignIn />
      <p className="text-center text-sm text-gray-500">
        No account?{' '}
        <Link href="/register" className="text-blue-400 hover:underline">
          Register
        </Link>
        {' · '}
        <Link href="/forgot-password" className="text-blue-400 hover:underline">
          Forgot password?
        </Link>
      </p>
    </AuthCard>
  );
}
