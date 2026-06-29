'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PostCard } from '@/components/posts/PostCard';
import { PostDetailModal } from '@/components/posts/PostDetailModal';
import { useUser } from '@/hooks/useProfile';
import { useUserPosts } from '@/hooks/usePosts';
import dayjs from 'dayjs';

export function UserProfileContent({ id }: { id: string }) {
  const { data: profile, isLoading, isError } = useUser(id);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useUserPosts(id);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="p-8 text-center text-gray-500">User not found.</div>
    );
  }

  return (
    <div>
      <div className="flex gap-4 border-b border-gray-800 p-6">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-blue-700 text-xl font-bold text-white">
          {profile.photoURL ? (
            <Image
              src={profile.photoURL}
              alt="avatar"
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : (
            (profile.name?.[0] ?? '?')
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            {profile.name} {profile.surname}
          </h1>
          <p className="text-sm text-gray-400">{profile.email}</p>
          {profile.createdAt && (
            <p className="mt-1 text-xs text-gray-500">
              Joined {dayjs(profile.createdAt).format('MMMM YYYY')}
            </p>
          )}
        </div>
      </div>

      {posts.map((post) => (
        <PostCard key={post.id} post={post} onSelect={() => setSelectedPostId(post.id)} />
      ))}

      {selectedPostId && (
        <PostDetailModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />
      )}

      {hasNextPage && (
        <div className="flex justify-center p-4">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-full border border-gray-700 px-6 py-2 text-sm text-gray-300 transition hover:bg-gray-800 disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
