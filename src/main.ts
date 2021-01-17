import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestApplicationOptions } from '@nestjs/common';

const corsOptions: CorsOptions = {
  origin: 'http://localhost:4200',
};

const applicationOptions: NestApplicationOptions = {
  cors: corsOptions,
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, applicationOptions);
  await app.listen(3000);
}
bootstrap();
