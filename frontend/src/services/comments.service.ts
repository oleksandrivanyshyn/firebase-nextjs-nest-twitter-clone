import { apiFetch } from '@/utils/api';
import type { Comment } from '@/types';

export const commentsService = {
  getByPost: (postId: string) =>
    apiFetch<Comment[]>(`/posts/${postId}/comments`),

  create: (postId: string, data: { text: string; parentCommentId?: string }) =>
    apiFetch<Comment>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (postId: string, commentId: string, text: string) =>
    apiFetch<Comment>(`/posts/${postId}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    }),

  remove: (postId: string, commentId: string) =>
    apiFetch(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),
};
