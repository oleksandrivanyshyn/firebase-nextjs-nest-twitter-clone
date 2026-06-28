import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { FirebaseService } from '../../integrations/firebase/firebase.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly firebase: FirebaseService) {}

  private get col() {
    return this.firebase.db.collection('posts');
  }

  private toData(snap: FirebaseFirestore.DocumentSnapshot) {
    const d = snap.data();
    if (!d) {
      throw new NotFoundException('Post not found');
    }
    const createdAt = d.createdAt as Timestamp | undefined;
    return {
      id: d.id as string,
      userId: d.userId as string,
      title: d.title as string,
      text: d.text as string,
      photoURL: (d.photoURL as string | null) ?? null,
      likesCount: (d.likesCount as number) ?? 0,
      dislikesCount: (d.dislikesCount as number) ?? 0,
      commentsCount: (d.commentsCount as number) ?? 0,
      score: (d.score as number) ?? 0,
      createdAt: createdAt?.toDate().toISOString() ?? new Date().toISOString(),
    };
  }

  async create(uid: string, dto: CreatePostDto) {
    const ref = this.col.doc();
    const data = {
      id: ref.id,
      userId: uid,
      title: dto.title,
      text: dto.text,
      photoURL: dto.photoURL ?? null,
      likesCount: 0,
      dislikesCount: 0,
      commentsCount: 0,
      score: 0,
      createdAt: FieldValue.serverTimestamp(),
    };
    await ref.set(data);
    return { ...data, id: ref.id, createdAt: new Date().toISOString() };
  }

  async findAll(limit = 10, startAfter?: string, q?: string) {
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      this.col;
    if (q) {
      query = query
        .where('title', '>=', q)
        .where('title', '<=', q + '\uf8ff')
        .orderBy('title');
    } else {
      query = query.orderBy('score', 'desc').orderBy('createdAt', 'desc');
    }
    query = query.limit(limit + 1);
    if (startAfter) {
      const cursor = await this.col.doc(startAfter).get();
      if (cursor.exists) {
        query = query.startAfter(cursor);
      }
    }
    const snaps = await query.get();
    const docs = snaps.docs;
    const hasMore = docs.length > limit;
    const items = (hasMore ? docs.slice(0, limit) : docs).map((s) =>
      this.toData(s),
    );
    const nextCursor = hasMore ? items[items.length - 1].id : null;
    return { posts: items, nextCursor };
  }

  async findByUser(userId: string, limit = 20, startAfter?: string) {
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      this.col
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit + 1);
    if (startAfter) {
      const cursor = await this.col.doc(startAfter).get();
      if (cursor.exists) {
        query = query.startAfter(cursor);
      }
    }
    const snaps = await query.get();
    const docs = snaps.docs;
    const hasMore = docs.length > limit;
    const items = (hasMore ? docs.slice(0, limit) : docs).map((s) =>
      this.toData(s),
    );
    const nextCursor = hasMore ? items[items.length - 1].id : null;
    return { posts: items, nextCursor };
  }

  async findOne(id: string) {
    const snap = await this.col.doc(id).get();
    if (!snap.exists) {
      throw new NotFoundException(`Post ${id} not found`);
    }
    return this.toData(snap);
  }

  async update(id: string, uid: string, dto: UpdatePostDto) {
    const snap = await this.col.doc(id).get();
    if (!snap.exists) {
      throw new NotFoundException(`Post ${id} not found`);
    }
    const data = snap.data()!;
    if (data.userId !== uid) {
      throw new ForbiddenException('Not the author');
    }
    await this.col.doc(id).update({ ...dto });
    return this.findOne(id);
  }

  async remove(id: string, uid: string) {
    const snap = await this.col.doc(id).get();
    if (!snap.exists) {
      throw new NotFoundException(`Post ${id} not found`);
    }
    const data = snap.data()!;
    if (data.userId !== uid) {
      throw new ForbiddenException('Not the author');
    }
    const batch = this.firebase.db.batch();
    batch.delete(this.col.doc(id));
    const likeRefs = await this.col.doc(id).collection('likes').listDocuments();
    likeRefs.forEach((ref) => batch.delete(ref));
    const commentRefs = await this.col
      .doc(id)
      .collection('comments')
      .listDocuments();
    commentRefs.forEach((ref) => batch.delete(ref));
    await batch.commit();
    return { success: true };
  }
}
