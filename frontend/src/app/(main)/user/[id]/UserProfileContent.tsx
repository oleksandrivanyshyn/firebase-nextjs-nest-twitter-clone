'use client';

import { useState } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { UserAvatar } from '@/components/ui/user-avatar';
import { PostDetailModal } from '@/components/posts/PostDetailModal';
import { useUser } from '@/hooks/useProfile';
import { useUserPosts } from '@/hooks/usePosts';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';

export function UserProfileContent({ id }: { id: string }) {
  const { data: profile, isLoading, isError } = useUser(id);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useUserPosts(id);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
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
        <UserAvatar src={profile.photoURL} name={profile.name} className="h-16 w-16 text-xl" />
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
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
