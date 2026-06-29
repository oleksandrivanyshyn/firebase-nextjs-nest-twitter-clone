'use client';

import { PostCard } from '@/components/posts/PostCard';
import { CommentTree } from '@/components/comments/CommentTree';
import { CommentForm } from '@/components/comments/CommentForm';
import { usePost } from '@/hooks/usePosts';
import { useComments } from '@/hooks/useComments';

export function PostContent({ id }: { id: string }) {
  const { data: post, isLoading, isError } = usePost(id);
  const { data: comments = [] } = useComments(id);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="p-8 text-center text-gray-500">Post not found.</div>
    );
  }

  return (
    <div>
      <PostCard post={post} showActions />
      <div className="border-b border-gray-800 p-4">
        <CommentForm postId={id} />
      </div>
      <CommentTree comments={comments} postId={id} />
    </div>
  );
}
