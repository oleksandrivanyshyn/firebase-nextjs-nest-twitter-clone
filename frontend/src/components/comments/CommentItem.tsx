'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Trash2, Pencil, Reply } from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuthContext } from '@/contexts/AuthContext';
import { useDeleteComment, useUpdateComment } from '@/hooks/useComments';
import { useUser } from '@/hooks/useProfile';
import { CommentForm } from './CommentForm';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

dayjs.extend(relativeTime);

export interface CommentNode {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  parentCommentId: string | null;
  postId: string;
  replies: CommentNode[];
}

interface Props {
  comment: CommentNode;
  postId: string;
  depth: number;
}

export function CommentItem({ comment, postId, depth }: Props) {
  const { user } = useAuthContext();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const isOwner = user?.uid === comment.userId;

  const { data: author } = useUser(comment.userId);
  const deleteComment = useDeleteComment(postId);
  const updateComment = useUpdateComment(postId);

  return (
    <div
      className={`border-b border-border p-4 ${depth > 0 ? 'ml-8 border-l border-border' : ''}`}
    >
      <div className="flex gap-3">
        <UserAvatar src={author?.photoURL} name={author?.name} className="h-8 w-8 text-xs" />

        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-foreground">
              {author ? `${author.name} ${author.surname}` : '…'}
            </span>
            <span className="text-muted-foreground">
              {dayjs(comment.createdAt).fromNow()}
            </span>
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updateComment.mutate(
                      { commentId: comment.id, text: editText },
                      { onSuccess: () => setEditing(false) },
                    )
                  }
                  disabled={updateComment.isPending}
                  className="rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditText(comment.text);
                    setEditing(false);
                  }}
                  className="rounded-full border border-border px-4 py-1 text-xs text-muted-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">{comment.text}</p>
          )}

          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            {user && (
              <button
                onClick={() => setReplying((r) => !r)}
                aria-label="Reply to comment"
                className="flex items-center gap-1 transition hover:text-foreground"
              >
                <Reply className="h-3 w-3" /> Reply
              </button>
            )}
            {isOwner && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  aria-label="Edit comment"
                  className="flex items-center gap-1 transition hover:text-yellow-400"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <ConfirmDialog
                  trigger={
                    <button aria-label="Delete comment" className="flex items-center gap-1 transition hover:text-red-400">
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  }
                  title="Delete comment?"
                  description="This action cannot be undone."
                  onConfirm={() => deleteComment.mutate(comment.id)}
                />
              </>
            )}
          </div>

          {replying && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentCommentId={comment.id}
                onSuccess={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies.map((r) => (
        <CommentItem key={r.id} comment={r} postId={postId} depth={depth + 1} />
      ))}
    </div>
  );
}
