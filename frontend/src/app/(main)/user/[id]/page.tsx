'use client';

import { use } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { useUser } from '@/hooks/useProfile';
import { useUserPosts } from '@/hooks/usePosts';
import dayjs from 'dayjs';

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: profile } = useUser(id);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUserPosts(id);

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div>
      <div className="flex gap-4 border-b border-gray-800 p-6">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-blue-700 text-xl font-bold text-white">
          {profile?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photoURL}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            (profile?.name?.[0] ?? '?')
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            {profile ? `${profile.name} ${profile.surname}` : '…'}
          </h1>
          <p className="text-sm text-gray-400">{profile?.email}</p>
          {profile?.createdAt && (
            <p className="mt-1 text-xs text-gray-500">
              Joined {dayjs(profile.createdAt).format('MMMM YYYY')}
            </p>
          )}
        </div>
      </div>

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

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
