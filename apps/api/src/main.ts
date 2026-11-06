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
  // Contenido público igual para todos (CMS y blog): un CDN/proxy puede guardarlo 30 s y no llegar a la base en cada visita.
  // Solo estas rutas GET; el resto de /public lleva datos del visitante y no se cachea.
  app.use((req: { method: string; path: string }, res: { setHeader(k: string, v: string): void }, next: () => void) => {
    if (req.method === 'GET' && /^\/public\/(contenido|blog)(\/|$)/.test(req.path)) res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=60');
    next();
  });
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
  // WEB_ORIGIN = dashboard. PUBLIC_WEB_ORIGINS (coma) = webs públicas estáticas que envían formularios directo a /public/*.
  const origenes = [process.env.WEB_ORIGIN ?? 'http://localhost:3000', ...(process.env.PUBLIC_WEB_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean)];
  app.enableCors({ origin: origenes, credentials: true });
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
