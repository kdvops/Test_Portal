import mongoose from 'mongoose';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

// IMPORT INTERCEPTOR
import { UrlSvReplacerInterceptor } from './interceptors/global-replace.interceptor';

async function bootstrap() {
  const port = process.env.PORT || 3050;
  const app = await NestFactory.create(AppModule);

  mongoose.set('toObject', { virtuals: false });
  mongoose.set('toJSON', { virtuals: false });

  app.use(bodyParser.json({ limit: '300mb' }));
  app.use(bodyParser.urlencoded({ limit: '300mb', extended: true }));

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  // INTERCEPTORS GLOBAL
  app.useGlobalInterceptors(new UrlSvReplacerInterceptor());

  await app.listen(port);
  Logger.log(`🚀 Server running on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
