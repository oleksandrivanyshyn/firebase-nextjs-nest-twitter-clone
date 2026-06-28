import { apiFetch } from '@/utils/api';
import type { UserProfile } from '@/types';

export const profileService = {
  getMe: () => apiFetch<UserProfile>('/users/me'),

  getUser: (uid: string) => apiFetch<UserProfile>(`/users/${uid}`),

  update: (data: {
    name?: string;
    surname?: string;
    photoURL?: string | null;
  }) =>
    apiFetch<UserProfile>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAccount: () => apiFetch('/users/me', { method: 'DELETE' }),
};
