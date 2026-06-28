'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/utils/api';
import { PostCard } from '@/components/posts/PostCard';
import { CommentTree } from '@/components/comments/CommentTree';
import { CommentForm } from '@/components/comments/CommentForm';
import type { Post, Comment } from '@/types';

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: post } = useQuery({
    queryKey: ['post', id],
    queryFn: () => apiFetch<Post>(`/posts/${id}`),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => apiFetch<Comment[]>(`/posts/${id}/comments`),
  });

  if (!post) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
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
