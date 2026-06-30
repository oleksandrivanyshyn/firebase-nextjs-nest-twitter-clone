'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserAvatar } from '@/components/ui/user-avatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePost } from '@/hooks/usePosts';
import { useComments } from '@/hooks/useComments';
import { useMyReaction, useReact } from '@/hooks/useReactions';
import { useAuthContext } from '@/contexts/AuthContext';
import { useUser } from '@/hooks/useProfile';
import { CommentTree } from '@/components/comments/CommentTree';
import { CommentForm } from '@/components/comments/CommentForm';
import { Spinner } from '@/components/ui/spinner';

dayjs.extend(relativeTime);

function Author({ userId }: { userId: string }) {
  const { data: author } = useUser(userId);
  return (
    <Link href={`/user/${userId}`} className="flex items-center gap-3">
      <UserAvatar src={author?.photoURL} name={author?.name} className="h-10 w-10" />
      <span className="font-semibold text-white hover:underline">
        {author ? `${author.name} ${author.surname}` : '…'}
      </span>
    </Link>
  );
}

interface Props {
  postId: string;
  onClose: () => void;
}

export function PostDetailModal({ postId, onClose }: Props) {
  const { user } = useAuthContext();
  const { data: post, isLoading, isError } = usePost(postId);
  const { data: comments = [] } = useComments(postId);
  const { data: reaction } = useMyReaction(postId, user?.uid);
  const react = useReact(postId);

  const handleReact = (type: 'like' | 'dislike') => {
    if (user) react.mutate(type);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-[95vw] max-w-2xl bg-gray-900 text-white lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Post</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          {isLoading && (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          )}

          {(isError || (!isLoading && !post)) && (
            <p className="p-8 text-center text-gray-500">Post not found.</p>
          )}

          {post && (
            <>
              <div className="space-y-3">
                <Author userId={post.userId} />

                <h2 className="text-xl font-bold text-white">{post.title}</h2>
                <p className="whitespace-pre-wrap text-gray-300">{post.text}</p>

                {post.photoURL && (
                  <Image
                    src={post.photoURL}
                    alt="post"
                    width={800}
                    height={400}
                    className="w-full rounded-xl object-contain"
                  />
                )}

                <p className="text-xs text-gray-500">
                  {dayjs(post.createdAt).format('h:mm A · MMM D, YYYY')}
                </p>
              </div>

              <div className="flex items-center gap-6 border-y border-gray-800 py-3 text-sm text-gray-400">
                <button
                  onClick={() => handleReact('like')}
                  aria-label="Like"
                  aria-pressed={reaction?.type === 'like'}
                  className={`flex items-center gap-2 transition hover:text-blue-400 ${reaction?.type === 'like' ? 'text-blue-400' : ''}`}
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
                  className={`flex items-center gap-2 transition hover:text-red-400 ${reaction?.type === 'dislike' ? 'text-red-400' : ''}`}
                >
                  <ThumbsDown
                    className="h-4 w-4"
                    fill={reaction?.type === 'dislike' ? 'currentColor' : 'none'}
                  />
                  {post.dislikesCount}
                </button>

                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {post.commentsCount}
                </span>
              </div>

              <div className="space-y-4 pt-4">
                {user && <CommentForm postId={postId} />}
                <CommentTree comments={comments} postId={postId} />
              </div>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
