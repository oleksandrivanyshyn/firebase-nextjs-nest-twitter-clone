'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserAvatar } from '@/components/ui/user-avatar';
import { PostImage } from './PostImage';
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
import { Skeleton } from '@/components/ui/skeleton';

function CommentSkeleton() {
  return (
    <div className="flex gap-3 border-b border-border p-4">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

dayjs.extend(relativeTime);

function Author({ userId }: { userId: string }) {
  const { data: author } = useUser(userId);
  return (
    <Link href={`/user/${userId}`} className="flex items-center gap-3">
      <UserAvatar src={author?.photoURL} name={author?.name} className="h-10 w-10" />
      <span className="font-semibold text-foreground hover:underline">
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
  const { user, needsEmailVerification } = useAuthContext();
  const router = useRouter();
  const { data: post, isLoading, isError } = usePost(postId);
  const { data: comments = [], isLoading: isLoadingComments } = useComments(postId);
  const { data: reaction } = useMyReaction(postId, user?.uid);
  const react = useReact(postId);

  const handleReact = (type: 'like' | 'dislike') => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (needsEmailVerification) return;
    react.mutate(type);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-[95vw] max-w-2xl bg-card text-card-foreground lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Post</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          {isLoading && (
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          )}

          {(isError || (!isLoading && !post)) && (
            <p className="p-8 text-center text-muted-foreground">Post not found.</p>
          )}

          {post && (
            <>
              <div className="space-y-3">
                <Author userId={post.userId} />

                {post.photoURL && (
                  <PostImage
                    src={post.photoURL}
                    className="w-full rounded-xl object-contain"
                  />
                )}

                <h2 className="text-xl font-bold text-foreground">{post.title}</h2>
                <p className="whitespace-pre-wrap text-muted-foreground">{post.text}</p>

                <p className="text-xs text-muted-foreground">
                  {dayjs(post.createdAt).format('h:mm A · MMM D, YYYY')}
                </p>
              </div>

              <div className="flex items-center gap-6 border-y border-border py-3 text-sm text-muted-foreground">
                <button
                  onClick={() => handleReact('like')}
                  aria-label="Like"
                  aria-pressed={reaction?.type === 'like'}
                  disabled={needsEmailVerification}
                  title={needsEmailVerification ? 'Verify your email to react' : undefined}
                  className={`flex items-center gap-2 transition hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-muted-foreground ${reaction?.type === 'like' ? 'text-blue-400' : ''}`}
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
                  disabled={needsEmailVerification}
                  title={needsEmailVerification ? 'Verify your email to react' : undefined}
                  className={`flex items-center gap-2 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-muted-foreground ${reaction?.type === 'dislike' ? 'text-red-400' : ''}`}
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
                <CommentForm postId={postId} />
                {isLoadingComments ? (
                  <>
                    <CommentSkeleton />
                    <CommentSkeleton />
                  </>
                ) : (
                  <CommentTree comments={comments} postId={postId} />
                )}
              </div>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
