import {
  InfiniteData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { reactionsService } from '@/services/reactions.service';
import { useAuthContext } from '@/contexts/AuthContext';
import type { PaginatedPosts, Post } from '@/types';

type ReactionType = 'like' | 'dislike';
type Reaction = { type: ReactionType | null };

export function useMyReaction(postId: string, userId?: string) {
  return useQuery({
    queryKey: ['reaction', postId, userId],
    queryFn: () => reactionsService.getMyReaction(postId),
    enabled: !!userId,
  });
}

// Mirrors the toggle semantics of the backend transaction in
// reactions.service.ts so the optimistic update matches the real outcome.
function computeReactionDelta(current: ReactionType | null, type: ReactionType) {
  if (current === type) {
    return {
      newType: null as ReactionType | null,
      likeDelta: type === 'like' ? -1 : 0,
      dislikeDelta: type === 'dislike' ? -1 : 0,
    };
  }
  return {
    newType: type,
    likeDelta: type === 'like' ? 1 : current ? -1 : 0,
    dislikeDelta: type === 'dislike' ? 1 : current ? -1 : 0,
  };
}

function patchPost(postId: string, likeDelta: number, dislikeDelta: number) {
  return (post: Post) =>
    post.id === postId
      ? {
          ...post,
          likesCount: post.likesCount + likeDelta,
          dislikesCount: post.dislikesCount + dislikeDelta,
        }
      : post;
}

export function useReact(postId: string) {
  const qc = useQueryClient();
  const { user } = useAuthContext();
  const reactionKey = ['reaction', postId, user?.uid];

  return useMutation({
    mutationFn: (type: ReactionType) => reactionsService.react(postId, type),

    // Feed/profile lists are sorted by score, which changes the instant a
    // like/dislike lands. Invalidating those lists here would reshuffle the
    // post out from under the user's cursor, so instead we patch counts
    // in place — the list re-sorts naturally on the next real reload.
    onMutate: async (type) => {
      await qc.cancelQueries({ queryKey: ['reaction', postId] });

      const prevReaction = qc.getQueryData<Reaction>(reactionKey);
      const { newType, likeDelta, dislikeDelta } = computeReactionDelta(
        prevReaction?.type ?? null,
        type,
      );
      const apply = patchPost(postId, likeDelta, dislikeDelta);

      qc.setQueryData<Reaction>(reactionKey, { type: newType });

      const prevPostsQueries = qc.getQueriesData<InfiniteData<PaginatedPosts>>({
        queryKey: ['posts'],
      });
      const prevUserPostsQueries = qc.getQueriesData<
        InfiniteData<PaginatedPosts>
      >({ queryKey: ['userPosts'] });
      const prevPost = qc.getQueryData<Post>(['post', postId]);

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
      if (prevPost) qc.setQueryData(['post', postId], apply(prevPost));

      return { prevReaction, prevPostsQueries, prevUserPostsQueries, prevPost };
    },

    onError: (_err, _type, ctx) => {
      if (!ctx) return;
      qc.setQueryData(reactionKey, ctx.prevReaction);
      ctx.prevPostsQueries.forEach(([key, data]) => qc.setQueryData(key, data));
      ctx.prevUserPostsQueries.forEach(([key, data]) =>
        qc.setQueryData(key, data),
      );
      if (ctx.prevPost) qc.setQueryData(['post', postId], ctx.prevPost);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['reaction', postId] });
      qc.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}
