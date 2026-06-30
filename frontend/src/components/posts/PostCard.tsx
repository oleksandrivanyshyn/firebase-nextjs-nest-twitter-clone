'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { useDeletePost } from '@/hooks/usePosts';
import { useMyReaction, useReact } from '@/hooks/useReactions';
import { useUser } from '@/hooks/useProfile';
import { EditPostModal } from './EditPostModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { UserAvatar } from '@/components/ui/user-avatar';
import type { Post } from '@/types';

dayjs.extend(relativeTime);

interface Props {
  post: Post;
  onSelect?: () => void;
  onDeleted?: () => void;
  showActions?: boolean;
}

export function PostCard({ post, onSelect, onDeleted, showActions = true }: Props) {
  const { user } = useAuthContext();
  const router = useRouter();
  const isOwner = user?.uid === post.userId;
  const [showEdit, setShowEdit] = useState(false);

  const { data: reaction } = useMyReaction(post.id, user?.uid);
  const { data: author } = useUser(post.userId);
  const react = useReact(post.id);
  const deletePost = useDeletePost();

  const handleReact = (type: 'like' | 'dislike') => {
    if (!user) {
      router.push('/login');
      return;
    }
    react.mutate(type);
  };

  return (
    <>
      <article className="border-b border-gray-800 p-4 transition hover:bg-gray-900/50">
        <div className="flex gap-3">
          <Link href={`/user/${post.userId}`} className="shrink-0">
            <UserAvatar src={author?.photoURL} name={author?.name} className="h-10 w-10" />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/user/${post.userId}`}
                className="truncate font-semibold text-white hover:underline"
              >
                {author ? `${author.name} ${author.surname}` : '…'}
              </Link>
              <span className="shrink-0 text-xs text-gray-500">
                {dayjs(post.createdAt).fromNow()}
              </span>
            </div>

            <button
              onClick={onSelect}
              className="block w-full text-left"
            >
              <h2 className="mt-1 font-medium text-gray-100">{post.title}</h2>
              <p className="mt-1 line-clamp-3 text-sm text-gray-400">
                {post.text}
              </p>
              {post.photoURL && (
                <Image
                  src={post.photoURL}
                  alt="post"
                  width={800}
                  height={400}
                  className="mt-2 max-h-96 w-full rounded-xl object-cover"
                />
              )}
            </button>

            {showActions && (
              <div className="mt-3 flex items-center gap-6 text-sm text-gray-500">
                <button
                  onClick={() => handleReact('like')}
                  aria-label="Like"
                  aria-pressed={reaction?.type === 'like'}
                  className={`flex items-center gap-1 transition hover:text-blue-400 ${reaction?.type === 'like' ? 'text-blue-400' : ''}`}
                >
                  <ThumbsUp
                    className="h-4 w-4"
                    fill={reaction?.type === 'like' ? 'currentColor' : 'none'}
                  />
                  {post.likesCount}
                </button>

                <button
                  onClick={() => handleReact('dislike')}
                  aria-label="Dislike"
                  aria-pressed={reaction?.type === 'dislike'}
                  className={`flex items-center gap-1 transition hover:text-blue-400 ${reaction?.type === 'dislike' ? 'text-blue-400' : ''}`}
                >
                  <ThumbsDown
                    className="h-4 w-4"
                    fill={
                      reaction?.type === 'dislike' ? 'currentColor' : 'none'
                    }
                  />
                  {post.dislikesCount}
                </button>

                <button
                  onClick={onSelect}
                  className="flex items-center gap-1 transition hover:text-green-400"
                >
                  <MessageCircle className="h-4 w-4" />
                  {post.commentsCount}
                </button>

                {isOwner && (
                  <>
                    <button
                      onClick={() => setShowEdit(true)}
                      aria-label="Edit post"
                      className="ml-auto transition hover:text-yellow-400"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <ConfirmDialog
                      trigger={
                        <button aria-label="Delete post" className="transition hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      }
                      title="Delete post?"
                      description="This action cannot be undone."
                      onConfirm={() => deletePost.mutate(post.id, { onSuccess: onDeleted })}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </article>

      {showEdit && (
        <EditPostModal post={post} onClose={() => setShowEdit(false)} />
      )}
    </>
  );
}
