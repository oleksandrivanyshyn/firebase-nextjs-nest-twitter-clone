import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

const algoliaAppId = defineSecret('ALGOLIA_APP_ID');
const algoliaApiKey = defineSecret('ALGOLIA_API_KEY');

const expressApp = express();
let initialized = false;

async function bootstrap() {
  if (initialized) return;
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn'],
  });
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'https://twitter-clone-927ae.web.app',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.init();
  initialized = true;
}

export const api = onRequest(
  { region: 'us-central1', memory: '512MiB', secrets: [algoliaAppId, algoliaApiKey] },
  async (req, res) => {
    await bootstrap();
    expressApp(req, res);
  },
);
