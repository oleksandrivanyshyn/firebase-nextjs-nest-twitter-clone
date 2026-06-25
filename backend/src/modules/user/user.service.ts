import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { FieldValue } from 'firebase-admin/firestore';
import {FirebaseService} from "../../integrations/firebase/firebase.service";

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
    await this.col.doc(uid).set(
      { ...data, uid, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
    return this.getProfile(uid);
  }

  async updateProfile(uid: string, dto: UpdateUserDto) {
    return this.upsertProfile(uid, dto as Record<string, unknown>);
  }

  async deleteAccount(uid: string) {
    await this.col.doc(uid).delete();
    await this.firebase.auth.deleteUser(uid);
  }
}
