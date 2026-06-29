import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { FieldValue } from 'firebase-admin/firestore';
import { FirebaseService } from '../../integrations/firebase/firebase.service';

@Injectable()
export class UserService {
  constructor(private readonly firebase: FirebaseService) {}

  private get col() {
    return this.firebase.db.collection('users');
  }

  async getProfile(uid: string) {
    const snap = await this.col.doc(uid).get();
    if (!snap.exists) throw new NotFoundException(`User ${uid} not found`);
    return snap.data();
  }

  async upsertProfile(uid: string, data: Record<string, unknown>) {
    await this.col
      .doc(uid)
      .set(
        { ...data, uid, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );
    return this.getProfile(uid);
  }

  async updateProfile(uid: string, dto: UpdateUserDto) {
    return this.upsertProfile(uid, dto as Record<string, unknown>);
  }

  async deleteAccount(uid: string) {
    const db = this.firebase.db;

    // Delete user's posts and each post's likes + comments subcollections
    const postsSnap = await db
      .collection('posts')
      .where('userId', '==', uid)
      .get();
    for (const postDoc of postsSnap.docs) {
      const batch = db.batch();
      batch.delete(postDoc.ref);
      const [likeRefs, commentRefs] = await Promise.all([
        postDoc.ref.collection('likes').listDocuments(),
        postDoc.ref.collection('comments').listDocuments(),
      ]);
      likeRefs.forEach((ref) => batch.delete(ref));
      commentRefs.forEach((ref) => batch.delete(ref));
      await batch.commit();
    }

    // Delete user's comments on other people's posts
    const commentsSnap = await db
      .collectionGroup('comments')
      .where('userId', '==', uid)
      .get();
    if (!commentsSnap.empty) {
      const batch = db.batch();
      commentsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    await this.col.doc(uid).delete();
    await this.firebase.auth.deleteUser(uid);
  }
}
