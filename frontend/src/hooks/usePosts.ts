import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { postsService } from '@/services/posts.service';

export function useFeed(search: string) {
  return useInfiniteQuery({
    queryKey: ['posts', search],
    queryFn: ({ pageParam }) =>
      postsService.getAll({
        limit: 10,
        startAfter: pageParam,
        q: search || undefined,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
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
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postsService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });
}
