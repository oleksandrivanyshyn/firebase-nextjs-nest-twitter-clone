'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@/hooks/useAuth';
import { useAuthContext } from '@/contexts/AuthContext';
import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { PhoneSignIn } from '@/components/auth/PhoneSignIn';
import { Button } from '@/components/ui/button';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/feed');
  }, [user, loading, router]);

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
          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
            Email
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">
            Password
          </label>
          <input
            {...register('password')}
            id="password"
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSigningIn}
          className="w-full bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-500"
        >
          {isSigningIn ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
      <GoogleSignInButton />
      <PhoneSignIn />
      <p className="text-center text-sm text-muted-foreground">
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
