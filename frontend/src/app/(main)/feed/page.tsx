'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '@/utils/api';
import { PostCard } from '@/components/posts/PostCard';
import { useDebounce } from '@/hooks/useDebounce';
import { useState } from 'react';
import type { PaginatedPosts } from '@/types';

export default function FeedPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['posts', debouncedSearch],
      queryFn: ({ pageParam }) =>
        apiFetch<PaginatedPosts>(
          `/posts?limit=10${pageParam ? `&startAfter=${pageParam}` : ''}${debouncedSearch ? `&q=${encodeURIComponent(debouncedSearch)}` : ''}`,
        ),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) => last.nextCursor ?? undefined,
    });

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
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {!isLoading && posts.length === 0 && (
        <p className="p-8 text-center text-gray-500">No posts yet.</p>
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
