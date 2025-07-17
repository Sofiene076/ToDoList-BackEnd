import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule, { abortOnError: false });
  const app = await NestFactory.create(AppModule);
  // Enable CORS for your frontend
  app.enableCors({
    origin: 'http://localhost:3001', // Your Next.js dev server
    credentials: true, // Needed if you plan to send cookies
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
