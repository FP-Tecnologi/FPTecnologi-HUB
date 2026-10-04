import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

const LIMITE_KEY = 'limitePeticiones';

/** Tope propio de peticiones por IP y ruta: `@Limite(5, 60_000)` = 5 por minuto. Sustituye a @nestjs/throttler (incompatible con Nest 12 ESM). */
export const Limite = (max: number, ventanaMs = 60_000) => SetMetadata(LIMITE_KEY, { max, ventanaMs });

const POR_DEFECTO = { lectura: { max: 600, ventanaMs: 60_000 }, escritura: { max: 90, ventanaMs: 60_000 } };

/** Guard global. Contador en memoria (un solo proceso); si la API escala a varias instancias hay que moverlo a Redis. */
@Injectable()
export class LimitePeticionesGuard implements CanActivate {
  private readonly cubos = new Map<string, { n: number; reinicia: number }>();

  constructor(private readonly reflector: Reflector) {
    setInterval(() => {
      const ahora = Date.now();
      for (const [k, v] of this.cubos) if (v.reinicia <= ahora) this.cubos.delete(k);
    }, 60_000).unref();
  }

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    const explicito = this.reflector.getAllAndOverride<{ max: number; ventanaMs: number } | undefined>(LIMITE_KEY, [ctx.getHandler(), ctx.getClass()]);
    const { max, ventanaMs } = explicito ?? (req.method === 'GET' ? POR_DEFECTO.lectura : POR_DEFECTO.escritura);
    // /public/* lo llama el proxy de la web (todas las visitas llegan con la misma IP): ahí manda x-forwarded-for.
    const reenviada = req.path.startsWith('/public/') ? (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() : undefined;
    const clave = `${reenviada || req.ip}|${req.method}|${req.route?.path ?? req.path}`;
    const ahora = Date.now();
    const cubo = this.cubos.get(clave);
    if (!cubo || cubo.reinicia <= ahora) {
      this.cubos.set(clave, { n: 1, reinicia: ahora + ventanaMs });
      return true;
    }
    if (++cubo.n > max) throw new HttpException('Demasiadas solicitudes. Intenta de nuevo en un momento.', HttpStatus.TOO_MANY_REQUESTS);
    return true;
  }
}
