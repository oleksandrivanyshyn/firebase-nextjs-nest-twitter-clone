'use client';

import { useState } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { PostCardSkeleton } from '@/components/posts/PostCardSkeleton';
import { PostDetailModal } from '@/components/posts/PostDetailModal';
import { SegmentControl } from '@/components/ui/segment-control';
import { useFeed } from '@/hooks/usePosts';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

type Sort = 'top' | 'new';
type Scope = 'all' | 'mine';

export default function FeedPage() {
  const { user } = useAuthContext();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>('top');
  const [scope, setScope] = useState<Scope>('all');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useFeed(
    debouncedSearch,
    sort,
    scope === 'mine' ? user?.uid : undefined,
  );

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div>
      <div className="sticky top-0 z-10 space-y-3 border-b border-border bg-background/90 p-4 backdrop-blur">
        <h1 className="text-xl font-bold text-foreground">Home</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts…"
          className="w-full rounded-full border border-border bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none"
        />
        <div className="flex items-center justify-between gap-2">
          <SegmentControl
            value={sort}
            onChange={setSort}
            options={[
              { value: 'top', label: 'Top' },
              { value: 'new', label: 'New' },
            ]}
          />
          {user && (
            <SegmentControl
              value={scope}
              onChange={setScope}
              options={[
                { value: 'all', label: 'All' },
                { value: 'mine', label: 'Mine' },
              ]}
            />
          )}
        </div>
      </div>

      {isLoading && (
        <div>
          {Array.from({ length: 4 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
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
        <p className="p-8 text-center text-muted-foreground">No posts yet.</p>
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
