import { apiFetch } from '@/utils/api';
import type { Comment, PostCountsSync } from '@/types';

export const commentsService = {
  getByPost: (postId: string) =>
    apiFetch<Comment[]>(`/posts/${postId}/comments`),

  create: (postId: string, data: { text: string; parentCommentId?: string }) =>
    apiFetch<Comment & PostCountsSync>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (postId: string, commentId: string, text: string) =>
    apiFetch<Comment>(`/posts/${postId}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    }),

  remove: (postId: string, commentId: string) =>
    apiFetch<{ success: boolean } & PostCountsSync>(
      `/posts/${postId}/comments/${commentId}`,
      { method: 'DELETE' },
    ),
};
