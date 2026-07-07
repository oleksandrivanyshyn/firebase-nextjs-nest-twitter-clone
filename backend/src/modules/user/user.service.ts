import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { FirebaseService } from '../../integrations/firebase/firebase.service';
import { AlgoliaService } from '../../integrations/algolia/algolia.service';
import { calcScore } from '../../common/helpers/score.helper';

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size)
    chunks.push(arr.slice(i, i + size));
  return chunks;
}

export interface UserProfile {
  uid: string;
  name: string;
  surname: string;
  photoURL: string | null;
  email: string | null;
  createdAt: string | null;
}

@Injectable()
export class UserService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly algolia: AlgoliaService,
  ) {}

  private get col() {
    return this.firebase.db.collection('users');
  }

  private toProfile(data: FirebaseFirestore.DocumentData): UserProfile {
    const createdAt = data.createdAt as Timestamp | undefined;
    return {
      uid: data.uid as string,
      name: data.name as string,
      surname: data.surname as string,
      photoURL: (data.photoURL as string | null) ?? null,
      email: (data.email as string | null) ?? null,
      createdAt: createdAt?.toDate().toISOString() ?? null,
    };
  }

  async getProfile(uid: string) {
    const snap = await this.col.doc(uid).get();
    if (!snap.exists) throw new NotFoundException(`User ${uid} not found`);
    return this.toProfile(snap.data()!);
  }

  async upsertProfile(uid: string, data: Record<string, unknown>) {
    const ref = this.col.doc(uid);
    const existing = await ref.get();
    await ref.set(
      {
        ...data,
        uid,
        updatedAt: FieldValue.serverTimestamp(),
        ...(!existing.exists && { createdAt: FieldValue.serverTimestamp() }),
      },
      { merge: true },
    );
    const snap = await ref.get();
    return this.toProfile(snap.data()!);
  }

  async updateProfile(uid: string, dto: UpdateUserDto) {
    const profile = await this.upsertProfile(uid, dto as Record<string, unknown>);
    if (dto.name !== undefined || dto.surname !== undefined) {
      void this.syncAuthorName(uid, `${profile.name} ${profile.surname}`.trim());
    }
    return profile;
  }

  // Post documents don't store authorName themselves (the frontend always
  // looks up the author live), but Algolia's denormalized copy goes stale
  // on rename unless we push it to every post the user has authored.
  private async syncAuthorName(uid: string, authorName: string) {
    const postsSnap = await this.firebase.db
      .collection('posts')
      .where('userId', '==', uid)
      .get();
    await Promise.all(
      postsSnap.docs.map((d) => this.algolia.updatePost(d.id, { authorName })),
    );
  }

  async deleteAccount(uid: string) {
    const db = this.firebase.db;

    const postsSnap = await db
      .collection('posts')
      .where('userId', '==', uid)
      .get();
    for (const postDoc of postsSnap.docs) {
      const [likeRefs, commentRefs] = await Promise.all([
        postDoc.ref.collection('likes').listDocuments(),
        postDoc.ref.collection('comments').listDocuments(),
      ]);
      const allRefs = [postDoc.ref, ...likeRefs, ...commentRefs];
      for (const chunk of chunkArray(allRefs, 490)) {
        const batch = db.batch();
        chunk.forEach((ref) => batch.delete(ref));
        await batch.commit();
      }
    }

    // Comments left by this user on OTHER users' posts (comments on their
    // own posts were already deleted above along with the post itself).
    // Group by post so each post's commentsCount/score is decremented once.
    const commentsSnap = await db
      .collectionGroup('comments')
      .where('userId', '==', uid)
      .get();
    const commentsByPost = new Map<
      string,
      FirebaseFirestore.QueryDocumentSnapshot[]
    >();
    for (const doc of commentsSnap.docs) {
      const postId = doc.data().postId as string;
      const arr = commentsByPost.get(postId) ?? [];
      arr.push(doc);
      commentsByPost.set(postId, arr);
    }
    for (const [postId, docs] of commentsByPost) {
      const postRef = db.collection('posts').doc(postId);
      // null means the post itself no longer exists (e.g. its owner deleted
      // it independently) — Algolia's copy was already removed by
      // PostsService.remove(), so skip re-syncing it.
      const result = await db.runTransaction(async (tx) => {
        const postSnap = await tx.get(postRef);
        if (!postSnap.exists) return null;
        const post = postSnap.data()!;
        const commentsCount = (post.commentsCount as number) ?? 0;
        const newCount = Math.max(0, commentsCount - docs.length);
        const newScore = calcScore((post.likesCount as number) ?? 0, newCount);
        docs.forEach((d) => tx.delete(d.ref));
        tx.update(postRef, { commentsCount: newCount, score: newScore });
        return { newCount, newScore };
      });
      if (result) {
        void this.algolia.updatePost(postId, {
          commentsCount: result.newCount,
          score: result.newScore,
        });
      }
    }

    // Likes/dislikes left by this user on OTHER users' posts.
    const likesSnap = await db
      .collectionGroup('likes')
      .where('userId', '==', uid)
      .get();
    for (const likeDoc of likesSnap.docs) {
      const postRef = likeDoc.ref.parent.parent;
      if (!postRef) continue;
      const likeType = likeDoc.data().type as 'like' | 'dislike' | undefined;
      const result = await db.runTransaction(async (tx) => {
        const postSnap = await tx.get(postRef);
        if (!postSnap.exists) return null;
        const post = postSnap.data()!;
        const likesCount = (post.likesCount as number) ?? 0;
        const dislikesCount = (post.dislikesCount as number) ?? 0;
        const newLikes =
          likeType === 'like' ? Math.max(0, likesCount - 1) : likesCount;
        const newDislikes =
          likeType === 'dislike'
            ? Math.max(0, dislikesCount - 1)
            : dislikesCount;
        const newScore = calcScore(newLikes, (post.commentsCount as number) ?? 0);
        tx.delete(likeDoc.ref);
        tx.update(postRef, {
          likesCount: newLikes,
          dislikesCount: newDislikes,
          score: newScore,
        });
        return { newLikes, newDislikes, newScore };
      });
      if (result) {
        void this.algolia.updatePost(postRef.id, {
          likesCount: result.newLikes,
          dislikesCount: result.newDislikes,
          score: result.newScore,
        });
      }
    }

    const postIds = postsSnap.docs.map((d) => d.id);
    await this.col.doc(uid).delete();
    await this.firebase.auth.deleteUser(uid);
    void this.algolia.deletePosts(postIds);
    return { success: true };
  }
}
