'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCreateComment } from '@/hooks/useComments';
import { useMe } from '@/hooks/useProfile';
import { UserAvatar } from '@/components/ui/user-avatar';

interface Props {
  postId: string;
  parentCommentId?: string;
  onSuccess?: () => void;
}

export function CommentForm({ postId, parentCommentId, onSuccess }: Props) {
  const { user, needsEmailVerification } = useAuthContext();
  const { data: profile } = useMe(!!user);
  const [text, setText] = useState('');
  const createComment = useCreateComment(postId);

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-blue-400 hover:underline">
          Sign in
        </Link>{' '}
        to leave a comment.
      </p>
    );
  }

  if (needsEmailVerification) {
    return (
      <p className="text-sm text-yellow-400">Verify your email to comment.</p>
    );
  }

  return (
    <div className="flex gap-3">
      <UserAvatar src={profile?.photoURL} name={profile?.name} className="h-8 w-8 shrink-0 text-xs" />
      <div className="flex-1 space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={parentCommentId ? 'Write a reply…' : 'Write a comment…'}
          rows={2}
          className="w-full resize-none rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={() =>
            createComment.mutate(
              { text, parentCommentId },
              {
                onSuccess: () => {
                  setText('');
                  onSuccess?.();
                },
              },
            )
          }
          disabled={!text.trim() || createComment.isPending}
          className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {createComment.isPending ? 'Posting…' : parentCommentId ? 'Reply' : 'Comment'}
        </button>
      </div>
    </div>
  );
}
