import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // this set up for nest know to use class ValidationPipe
  app.enableCors({
    origin: [
      'https://frontedn-shop-clothes.vercel.app',
      'https://frontend-cms-nine.vercel.app',
    ],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      // this will cut the field not extend in DTO define
      // whitelist: true
    }),
  );

  await app.listen(3333);
}
bootstrap();
