import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './integrations/firebase/firebase.module';
import { UserModule } from './modules/user/user.module';
import { PostsModule } from './modules/posts/posts.module';
import { ReactionsModule } from './modules/reactions/reactions.module';
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    FirebaseModule,
    UserModule,
    PostsModule,
    ReactionsModule,
    CommentsModule,
  ],
})
export class AppModule {}
