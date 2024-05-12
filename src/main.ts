import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // this set up for nest know to use class ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      // this will cut the field not extend in DTO define
      // whitelist: true
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: [
      'https://frontedn-shop-clothes-1wwb0z8k8-khanh-nguyens-projects-8c285c85.vercel.app/',
      'https://frontend-ipz9t38y2-khanh-nguyens-projects-8c285c85.vercel.app',
    ],
  }),
    await app.listen(3333);
}
bootstrap();
