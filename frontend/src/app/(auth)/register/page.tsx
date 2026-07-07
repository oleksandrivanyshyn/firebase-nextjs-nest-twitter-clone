'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/hooks/useAuth';
import { useAuthContext } from '@/contexts/AuthContext';
import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { PhoneSignIn } from '@/components/auth/PhoneSignIn';
import { Button } from '@/components/ui/button';

const schema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    surname: z.string().min(1, 'Surname is required'),
    email: z.string().email(),
    password: z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
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

  const { mutate: registerUser, isPending, error } = useRegister();

  const fields: Array<{
    key: keyof FormData;
    label: string;
    type: string;
    placeholder: string;
    autoComplete: string;
  }> = [
    { key: 'name', label: 'First Name', type: 'text', placeholder: 'John', autoComplete: 'given-name' },
    { key: 'surname', label: 'Last Name', type: 'text', placeholder: 'Doe', autoComplete: 'family-name' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
    { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
    { key: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
  ];

  return (
    <AuthCard title="Create Account">
      {error && (
        <p className="rounded-lg bg-red-900/40 p-3 text-sm text-red-300">
          {error.message}
        </p>
      )}
      <form
        onSubmit={handleSubmit((data) => registerUser(data))}
        className="space-y-4"
      >
        {fields.map((f) => (
          <div key={f.key}>
            <label htmlFor={f.key} className="block text-sm font-medium text-muted-foreground">
              {f.label}
            </label>
            <input
              {...register(f.key)}
              id={f.key}
              type={f.type}
              placeholder={f.placeholder}
              autoComplete={f.autoComplete}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none"
            />
            {errors[f.key] && (
              <p className="mt-1 text-xs text-red-400">
                {errors[f.key]?.message}
              </p>
            )}
          </div>
        ))}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-500"
        >
          {isPending ? 'Creating account…' : 'Register'}
        </Button>
      </form>
      <GoogleSignInButton />
      <PhoneSignIn />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-400 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
