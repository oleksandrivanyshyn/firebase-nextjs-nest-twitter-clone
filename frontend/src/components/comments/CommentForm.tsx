'use client';

import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCreateComment } from '@/hooks/useComments';

interface Props {
  postId: string;
  parentCommentId?: string;
  onSuccess?: () => void;
}

export function CommentForm({ postId, parentCommentId, onSuccess }: Props) {
  const { user } = useAuthContext();
  const [text, setText] = useState('');
  const createComment = useCreateComment(postId);

  if (!user) return null;

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
        {user.displayName?.[0] ?? user.email?.[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="flex-1 space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={parentCommentId ? 'Write a reply…' : 'Write a comment…'}
          rows={2}
          className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
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
          {createComment.isPending ? 'Posting…' : 'Reply'}
        </button>
      </div>
    </div>
  );
}
