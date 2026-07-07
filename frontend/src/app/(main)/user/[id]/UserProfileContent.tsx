'use client';

import { useState } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { PostCardSkeleton } from '@/components/posts/PostCardSkeleton';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { PostDetailModal } from '@/components/posts/PostDetailModal';
import { useUser } from '@/hooks/useProfile';
import { useUserPosts } from '@/hooks/usePosts';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';

export function UserProfileContent({ id }: { id: string }) {
  const { data: profile, isLoading, isError } = useUser(id);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPosts,
  } = useUserPosts(id);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  if (isLoading) {
    return (
      <div>
        <div className="flex gap-4 border-b border-border p-6">
          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
          <div className="space-y-2 pt-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="p-8 text-center text-muted-foreground">User not found.</div>
    );
  }

  return (
    <div>
      <div className="flex gap-4 border-b border-border p-6">
        <UserAvatar src={profile.photoURL} name={profile.name} className="h-16 w-16 text-xl" />
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {profile.name} {profile.surname}
          </h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          {profile.createdAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              Joined {dayjs(profile.createdAt).format('MMMM YYYY')}
            </p>
          )}
        </div>
      </div>

      {isLoadingPosts &&
        Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}

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
            className="rounded-full border-border text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
