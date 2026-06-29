import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { FieldValue } from 'firebase-admin/firestore';
import { FirebaseService } from '../../integrations/firebase/firebase.service';

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
}

@Injectable()
export class UserService {
  constructor(private readonly firebase: FirebaseService) {}

  private get col() {
    return this.firebase.db.collection('users');
  }

  private toProfile(data: FirebaseFirestore.DocumentData): UserProfile {
    return {
      uid: data.uid as string,
      name: data.name as string,
      surname: data.surname as string,
      photoURL: (data.photoURL as string | null) ?? null,
      email: (data.email as string | null) ?? null,
    };
  }

  async getProfile(uid: string) {
    const snap = await this.col.doc(uid).get();
    if (!snap.exists) throw new NotFoundException(`User ${uid} not found`);
    return this.toProfile(snap.data()!);
  }

  async upsertProfile(uid: string, data: Record<string, unknown>) {
    const ref = this.col.doc(uid);
    await ref.set(
      { ...data, uid, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
    const snap = await ref.get();
    return this.toProfile(snap.data()!);
  }

  async updateProfile(uid: string, dto: UpdateUserDto) {
    return this.upsertProfile(uid, dto as Record<string, unknown>);
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

    const commentsSnap = await db
      .collectionGroup('comments')
      .where('userId', '==', uid)
      .get();
    for (const chunk of chunkArray(
      commentsSnap.docs.map((d) => d.ref),
      490,
    )) {
      const batch = db.batch();
      chunk.forEach((ref) => batch.delete(ref));
      await batch.commit();
    }

    await this.col.doc(uid).delete();
    await this.firebase.auth.deleteUser(uid);
  }
}
