import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000; // Utiliser le port fourni par Render
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
}
bootstrap();
