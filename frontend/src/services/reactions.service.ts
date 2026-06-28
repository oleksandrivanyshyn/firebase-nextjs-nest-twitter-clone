import { apiFetch } from '@/utils/api';

export const reactionsService = {
  react: (postId: string, type: 'like' | 'dislike') =>
    apiFetch(`/posts/${postId}/react`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),

  getMyReaction: (postId: string) =>
    apiFetch<{ type: 'like' | 'dislike' | null }>(
      `/posts/${postId}/my-reaction`,
    ),
};
