import { Module } from '@nestjs/common';
import { FirebaseModule } from './integrations/firebase/firebase.module';
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [FirebaseModule, ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  })],
})
export class AppModule {}
