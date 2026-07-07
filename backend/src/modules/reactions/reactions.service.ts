import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../integrations/firebase/firebase.service';
import { AlgoliaService } from '../../integrations/algolia/algolia.service';
import { ReactDto } from './dto/react.dto';
import { calcScore } from '../../common/helpers/score.helper';

@Injectable()
export class ReactionsService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly algolia: AlgoliaService,
  ) {}

  async react(postId: string, uid: string, dto: ReactDto) {
    const db = this.firebase.db;
    const postRef = db.collection('posts').doc(postId);
    const likeRef = postRef.collection('likes').doc(uid);

    let newLikes = 0;
    let newDislikes = 0;
    let newScore = 0;

    await db.runTransaction(async (tx) => {
      const [postSnap, likeSnap] = await Promise.all([
        tx.get(postRef),
        tx.get(likeRef),
      ]);

      if (!postSnap.exists) {
        throw new NotFoundException('Post not found');
      }

      const post = postSnap.data();
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      let likeDelta = 0;
      let dislikeDelta = 0;

      if (likeSnap.exists) {
        const likeData = likeSnap.data();
        if (!likeData) {
          throw new NotFoundException('Reaction data not found');
        }
        const existing = likeData.type as 'like' | 'dislike';
        if (existing === dto.type) {
          tx.delete(likeRef);
          likeDelta = dto.type === 'like' ? -1 : 0;
          dislikeDelta = dto.type === 'dislike' ? -1 : 0;
        } else {
          tx.set(likeRef, { type: dto.type, userId: uid });
          likeDelta = dto.type === 'like' ? 1 : -1;
          dislikeDelta = dto.type === 'dislike' ? 1 : -1;
        }
      } else {
        tx.set(likeRef, { type: dto.type, userId: uid });
        likeDelta = dto.type === 'like' ? 1 : 0;
        dislikeDelta = dto.type === 'dislike' ? 1 : 0;
      }

      const likesCount = (post.likesCount as number) ?? 0;
      const dislikesCount = (post.dislikesCount as number) ?? 0;
      const commentsCount = (post.commentsCount as number) ?? 0;

      newLikes = likesCount + likeDelta;
      newDislikes = dislikesCount + dislikeDelta;
      newScore = calcScore(newLikes, commentsCount);

      tx.update(postRef, {
        likesCount: newLikes,
        dislikesCount: newDislikes,
        score: newScore,
      });
    });

    void this.algolia.updatePost(postId, {
      likesCount: newLikes,
      dislikesCount: newDislikes,
      score: newScore,
    });

    return { success: true };
  }

  async getUserReaction(
    postId: string,
    uid: string,
  ): Promise<{ type: 'like' | 'dislike' | null }> {
    const snap = await this.firebase.db
      .collection('posts')
      .doc(postId)
      .collection('likes')
      .doc(uid)
      .get();
    const data = snap.data();
    return {
      type: snap.exists && data ? (data.type as 'like' | 'dislike') : null,
    };
  }
}
