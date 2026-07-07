'use client';

import { CommentItem, type CommentNode } from './CommentItem';
import type { Comment } from '@/types';

function buildTree(comments: Comment[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  comments.forEach((c) =>
    map.set(c.id, { ...c, postId: c.postId, replies: [] }),
  );

  comments.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parentCommentId && map.has(c.parentCommentId)) {
      map.get(c.parentCommentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

interface Props {
  comments: Comment[];
  postId: string;
}

export function CommentTree({ comments, postId }: Props) {
  const tree = buildTree(comments);

  if (!tree.length) {
    return <p className="p-4 text-sm text-muted-foreground">No comments yet.</p>;
  }

  return (
    <div>
      {tree.map((c) => (
        <CommentItem key={c.id} comment={c} postId={postId} depth={0} />
      ))}
    </div>
  );
}
