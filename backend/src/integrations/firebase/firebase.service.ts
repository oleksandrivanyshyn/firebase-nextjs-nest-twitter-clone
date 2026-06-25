import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App;
  db: admin.firestore.Firestore;
  auth: admin.auth.Auth;
  storage: admin.storage.Storage;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');

    if (!admin.apps.length) {
      this.app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: projectId,
        storageBucket: `${projectId}.firebasestorage.app`,
      });
    } else {
      this.app = admin.apps[0]!;
    }
    this.db = admin.firestore(this.app);
    this.auth = admin.auth(this.app);
    this.storage = admin.storage(this.app);
  }
}