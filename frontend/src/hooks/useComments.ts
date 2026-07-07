import {
  InfiniteData,
  useMutation,
  useQuery,
  useQueryClient,
  QueryClient,
} from '@tanstack/react-query';
import { commentsService } from '@/services/comments.service';
import type { PaginatedPosts, Post } from '@/types';

function syncPostCounts(
  qc: QueryClient,
  postId: string,
  commentsCount: number,
  score: number,
) {
  const apply = (post: Post) =>
    post.id === postId ? { ...post, commentsCount, score } : post;

  qc.setQueriesData<InfiniteData<PaginatedPosts>>(
    { queryKey: ['posts'] },
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          posts: page.posts.map(apply),
        })),
      },
  );
  qc.setQueriesData<InfiniteData<PaginatedPosts>>(
    { queryKey: ['userPosts'] },
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          posts: page.posts.map(apply),
        })),
      },
  );

  const prevPost = qc.getQueryData<Post>(['post', postId]);
  if (prevPost) qc.setQueryData(['post', postId], apply(prevPost));
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentsService.getByPost(postId),
  });
}

export function useCreateComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { text: string; parentCommentId?: string }) =>
      commentsService.create(postId, data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['comments', postId] });
      syncPostCounts(qc, postId, result.postCommentsCount, result.postScore);
    },
  });
}

export function useUpdateComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      commentsService.update(postId, commentId, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', postId] }),
  });
}

export function useDeleteComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      commentsService.remove(postId, commentId),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['comments', postId] });
      syncPostCounts(qc, postId, result.postCommentsCount, result.postScore);
    },
  });
}
