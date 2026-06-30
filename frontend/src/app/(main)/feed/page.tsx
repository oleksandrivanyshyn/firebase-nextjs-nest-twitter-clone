'use client';

import { useState } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { PostDetailModal } from '@/components/posts/PostDetailModal';
import { useFeed } from '@/hooks/usePosts';
import { useDebounce } from '@/hooks/useDebounce';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

export default function FeedPage() {
  const [search, setSearch] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useFeed(debouncedSearch);

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/90 p-4 backdrop-blur">
        <h1 className="mb-3 text-xl font-bold text-white">Home</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts…"
          className="w-full rounded-full border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} onSelect={() => setSelectedPostId(post.id)} />
      ))}

      {selectedPostId && (
        <PostDetailModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />
      )}

      {isError && (
        <p className="p-8 text-center text-red-400">
          Failed to load posts. Please try again.
        </p>
      )}

      {!isLoading && !isError && posts.length === 0 && (
        <p className="p-8 text-center text-gray-500">No posts yet.</p>
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
