import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { assertRequiredEnv } from './config/assert-required-env.js';
import { swaggerBasicAuth } from './config/swagger-basic-auth.js';
import { uploadsDir } from './uploads/uploads.service.js';

async function bootstrap() {
  assertRequiredEnv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Detrás del proxy del hosting req.ip debe ser el cliente real (TRUST_PROXY = saltos de proxy, 0 si se expone directo).
  app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));
  app.use(helmet());
  app.use(cookieParser());
  app.use(swaggerBasicAuth);
  // Imágenes subidas desde el dashboard. helmet pone CORP same-origin; las fotos las pintan la web pública y el
  // dashboard (otro origen), así que aquí se permite explícitamente. nosniff evita que se interpreten como otra cosa.
  app.useStaticAssets(uploadsDir(), {
    prefix: '/uploads',
    maxAge: '7d',
    index: false,
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*'); // contenido público: el dashboard lo dibuja en un canvas (tarjeta digital descargable)
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  });
  // Origen explícito (no '*') + credentials:true — necesario para la cookie
  // httpOnly de "dispositivo confiable" (fetch cross-origin del dashboard).
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000', credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('FPTecnologi API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
