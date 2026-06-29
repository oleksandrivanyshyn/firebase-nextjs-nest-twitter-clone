import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isDev = process.env.NODE_ENV !== 'production';
  app.enableCors({
    origin: isDev ? /^http:\/\/localhost(:\d+)?$/ : (process.env.FRONTEND_URL ?? 'http://localhost:3000'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');

  await app.listen(Number(process.env.PORT) || 5000);
  console.log(
    `Backend running on http://localhost:${process.env.PORT ?? 5000}/api`,
  );
}
void bootstrap();
