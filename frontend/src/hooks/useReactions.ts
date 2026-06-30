import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reactionsService } from '@/services/reactions.service';

export function useMyReaction(postId: string, userId?: string) {
  return useQuery({
    queryKey: ['reaction', postId, userId],
    queryFn: () => reactionsService.getMyReaction(postId),
    enabled: !!userId,
  });
}

export function useReact(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type: 'like' | 'dislike') =>
      reactionsService.react(postId, type),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['post', postId] });
      qc.invalidateQueries({ queryKey: ['reaction', postId] });
      qc.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });
}
