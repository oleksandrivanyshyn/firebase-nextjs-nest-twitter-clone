import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { postsService } from '@/services/posts.service';

export function useFeed(
  search: string,
  sort: 'top' | 'new' = 'top',
  userId?: string,
) {
  return useInfiniteQuery({
    queryKey: ['posts', search, sort, userId ?? null],
    queryFn: ({ pageParam }) =>
      postsService.getAll({
        limit: 10,
        startAfter: pageParam,
        q: search || undefined,
        sort,
        userId,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => postsService.getOne(id),
  });
}

export function useUserPosts(userId: string) {
  return useInfiniteQuery({
    queryKey: ['userPosts', userId],
    queryFn: ({ pageParam }) =>
      postsService.getByUser(userId, { limit: 10, startAfter: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!userId,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post created');
    },
    onError: () => toast.error('Failed to create post'),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof postsService.update>[1];
    }) => postsService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['post', id] });
      qc.invalidateQueries({ queryKey: ['userPosts'] });
      toast.success('Post updated');
    },
    onError: () => toast.error('Failed to update post'),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postsService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['userPosts'] });
      toast.success('Post deleted');
    },
    onError: () => toast.error('Failed to delete post'),
  });
}
