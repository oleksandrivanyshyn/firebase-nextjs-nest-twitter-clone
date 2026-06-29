import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { FirebaseService } from '../../integrations/firebase/firebase.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { calcScore } from '../../common/helpers/score.helper';

@Injectable()
export class CommentsService {
  constructor(private readonly firebase: FirebaseService) {}

  private comments(postId: string) {
    return this.firebase.db
      .collection('posts')
      .doc(postId)
      .collection('comments');
  }

  private toData(snap: FirebaseFirestore.DocumentSnapshot) {
    const d = snap.data();
    if (!d) {
      throw new NotFoundException('Comment not found');
    }
    const createdAt = d.createdAt as Timestamp | undefined;
    return {
      id: d.id as string,
      postId: d.postId as string,
      userId: d.userId as string,
      text: d.text as string,
      parentCommentId: (d.parentCommentId as string | null) ?? null,
      createdAt: createdAt?.toDate().toISOString() ?? new Date().toISOString(),
    };
  }

  async create(postId: string, uid: string, dto: CreateCommentDto) {
    const db = this.firebase.db;
    const postRef = db.collection('posts').doc(postId);
    const commentRef = this.comments(postId).doc();

    const commentData = {
      id: commentRef.id,
      postId,
      userId: uid,
      text: dto.text,
      parentCommentId: dto.parentCommentId ?? null,
      createdAt: FieldValue.serverTimestamp(),
    };

    await db.runTransaction(async (tx) => {
      const postSnap = await tx.get(postRef);
      if (!postSnap.exists) {
        throw new NotFoundException('Post not found');
      }
      const post = postSnap.data();
      if (!post) {
        throw new NotFoundException('Post data not found');
      }
      const commentsCount = (post.commentsCount as number) ?? 0;
      const newCount = commentsCount + 1;
      tx.set(commentRef, commentData);
      tx.update(postRef, {
        commentsCount: newCount,
        score: calcScore((post.likesCount as number) ?? 0, newCount),
      });
    });

    return { ...commentData, createdAt: new Date().toISOString() };
  }

  async findByPost(postId: string) {
    const snaps = await this.comments(postId).orderBy('createdAt', 'asc').get();
    return snaps.docs.map((s) => this.toData(s));
  }

  async update(
    commentId: string,
    postId: string,
    uid: string,
    dto: UpdateCommentDto,
  ) {
    const ref = this.comments(postId).doc(commentId);
    const snap = await ref.get();
    if (!snap.exists) {
      throw new NotFoundException('Comment not found');
    }
    const data = snap.data();
    if (!data) {
      throw new NotFoundException('Comment data not found');
    }
    if (data.userId !== uid) {
      throw new ForbiddenException('Not the author');
    }
    await ref.update({ text: dto.text });
    return { ...this.toData(snap), text: dto.text };
  }

  async remove(commentId: string, postId: string, uid: string) {
    const db = this.firebase.db;
    const postRef = db.collection('posts').doc(postId);
    const commentRef = this.comments(postId).doc(commentId);

    const repliesSnap = await this.comments(postId)
      .where('parentCommentId', '==', commentId)
      .get();

    await db.runTransaction(async (tx) => {
      const [commentSnap, postSnap] = await Promise.all([
        tx.get(commentRef),
        tx.get(postRef),
      ]);
      if (!commentSnap.exists) {
        throw new NotFoundException('Comment not found');
      }
      const commentData = commentSnap.data();
      if (!commentData) {
        throw new NotFoundException('Comment data not found');
      }
      if (commentData.userId !== uid) {
        throw new ForbiddenException('Not the author');
      }

      const post = postSnap.data();
      if (!post) {
        throw new NotFoundException('Post data not found');
      }
      const commentsCount = (post.commentsCount as number) ?? 0;
      const deleteCount = 1 + repliesSnap.size;
      const newCount = Math.max(0, commentsCount - deleteCount);

      tx.delete(commentRef);
      repliesSnap.docs.forEach((doc) => tx.delete(doc.ref));
      tx.update(postRef, {
        commentsCount: newCount,
        score: calcScore((post.likesCount as number) ?? 0, newCount),
      });
    });

    return { success: true };
  }
}
