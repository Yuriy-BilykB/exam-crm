import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });
  // Swagger: npm i @nestjs/swagger, then add DocumentBuilder/SwaggerModule and set path api/docs
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
