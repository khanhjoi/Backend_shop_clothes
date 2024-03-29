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
      'http://localhost:5173',
      'http://localhost:4444',
    ],
  }),
    await app.listen(3333);
}
bootstrap();
