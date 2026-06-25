import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export function useSignIn() {
  const router = useRouter();
  return useMutation({
    mutationKey: ['auth', 'signIn'],
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signIn(email, password),
    onSuccess: () => router.replace('/feed'),
  });
}

export function useSignInWithGoogle() {
  const router = useRouter();
  return useMutation({
    mutationKey: ['auth', 'signInWithGoogle'],
    mutationFn: () => authService.signInWithGoogle(),
    onSuccess: () => router.replace('/feed'),
  });
}

export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: ({
      email,
      password,
      name,
      surname,
    }: {
      email: string;
      password: string;
      name: string;
      surname: string;
    }) => authService.register(email, password, name, surname),
    onSuccess: () => router.replace('/feed'),
  });
}

export function useSendPasswordReset() {
  return useMutation({
    mutationKey: ['auth', 'sendPasswordReset'],
    mutationFn: (email: string) => authService.sendPasswordReset(email),
  });
}

export function useSignOut() {
  const router = useRouter();
  return useMutation({
    mutationKey: ['auth', 'signOut'],
    mutationFn: () => authService.signOut(),
    onSuccess: () => router.replace('/login'),
  });
}
