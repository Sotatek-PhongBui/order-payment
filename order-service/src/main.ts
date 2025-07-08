import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.use((req: Request, res, next: NextFunction) => {
    logger.log(`Request: ${req.method} ${req.url}`);
    next();
  });

  const port = configService.get<number>('PORT', 4001);
  await app.listen(port);
  const logger = new Logger('bootstrap');
  logger.log(`Application started on ${await app.getUrl()}`);
}
bootstrap();
