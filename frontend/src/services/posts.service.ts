import { apiFetch } from '@/utils/api';
import type { Post, PaginatedPosts } from '@/types';

export const postsService = {
  getAll: (
    params: {
      limit?: number;
      startAfter?: string;
      q?: string;
      sort?: 'top' | 'new';
      userId?: string;
    } = {},
  ) => {
    const { limit = 10, startAfter, q, sort, userId } = params;
    const qs = new URLSearchParams({ limit: String(limit) });
    if (startAfter) qs.set('startAfter', startAfter);
    if (q) qs.set('q', q);
    if (sort) qs.set('sort', sort);
    if (userId) qs.set('userId', userId);
    return apiFetch<PaginatedPosts>(`/posts?${qs}`);
  },

  getOne: (id: string) => apiFetch<Post>(`/posts/${id}`),

  getByUser: (
    userId: string,
    params: { limit?: number; startAfter?: string } = {},
  ) => {
    const { limit = 20, startAfter } = params;
    const qs = new URLSearchParams({ limit: String(limit) });
    if (startAfter) qs.set('startAfter', startAfter);
    return apiFetch<PaginatedPosts>(`/users/${userId}/posts?${qs}`);
  },

  create: (data: { title: string; text: string; photoURL?: string | null }) =>
    apiFetch<Post>('/posts', { method: 'POST', body: JSON.stringify(data) }),

  update: (
    id: string,
    data: { title?: string; text?: string; photoURL?: string | null },
  ) =>
    apiFetch<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: string) => apiFetch(`/posts/${id}`, { method: 'DELETE' }),
};
