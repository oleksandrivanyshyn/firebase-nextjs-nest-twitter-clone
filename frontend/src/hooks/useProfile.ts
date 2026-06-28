import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/profile.service';
import { useSignOut } from './useAuth';

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getMe,
    enabled,
  });
}

export function useUser(uid: string) {
  return useQuery({
    queryKey: ['user', uid],
    queryFn: () => profileService.getUser(uid),
    enabled: !!uid,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: profileService.update,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['user', data?.uid] });
    },
  });
}

export function useDeleteAccount() {
  const signOut = useSignOut();
  return useMutation({
    mutationFn: profileService.deleteAccount,
    onSuccess: () => signOut.mutate(),
  });
}
