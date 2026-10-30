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
      // helmet manda X-Frame-Options: SAMEORIGIN; los PDF se previsualizan en un iframe del dashboard (otro origen).
      res.removeHeader('X-Frame-Options');
      res.setHeader('Content-Security-Policy', 'frame-ancestors *');
    },
  });
  // Origen explícito (no '*') + credentials:true — necesario para la cookie
  // httpOnly de "dispositivo confiable" (fetch cross-origin del dashboard).
  // Webs estáticas (p. ej. kelqa.com exportada como HTML) envían sus formularios directo a /public/*: esos orígenes
  // (CORS_PUBLIC_ORIGINS, separados por coma) solo se aceptan en rutas públicas y sin credenciales.
  const origenesPublicos = (process.env.CORS_PUBLIC_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean);
  const origenDashboard = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
  app.enableCors((req: { url?: string; headers: { origin?: string } }, cb: (err: Error | null, opts: object) => void) => {
    const origen = req.headers.origin;
    if (origen && origenesPublicos.includes(origen) && req.url?.startsWith('/public/')) cb(null, { origin: origen });
    else cb(null, { origin: origenDashboard, credentials: true });
  });
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
