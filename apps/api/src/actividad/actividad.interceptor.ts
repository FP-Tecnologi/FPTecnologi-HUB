import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActividadService } from './actividad.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

/** Rutas que ya registran su evento a mano (con más detalle) o que son ruido: el interceptor no las duplica. */
const OMITIR = ['auth', 'public', 'health', 'marcas', 'usuarios/global', 'invitaciones', 'soporte', 'notificaciones', 'chat', 'asistente', 'visitas'];
const SECRETO = /pass|clave|token|secret|codigo|otp|hash|authorization|cvv|tarjeta/i;
const ID = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d+)$/i;
const MAX_JSON = 4000;
const VERBO: Record<string, string> = { POST: 'crear', PUT: 'editar', PATCH: 'editar', DELETE: 'eliminar' };

/** Quita secretos y recorta textos largos del cuerpo de la petición para guardar "qué se envió" sin datos sensibles. */
export function limpiarCambios(valor: unknown, nivel = 0): unknown {
  if (valor == null || typeof valor === 'number' || typeof valor === 'boolean') return valor;
  if (typeof valor === 'string') return valor.length > 200 ? `${valor.slice(0, 200)}…` : valor;
  if (nivel >= 3) return '…';
  if (Array.isArray(valor)) return valor.slice(0, 20).map((v) => limpiarCambios(v, nivel + 1));
  if (typeof valor === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>).slice(0, 40)) out[k] = SECRETO.test(k) ? '[oculto]' : limpiarCambios(v, nivel + 1);
    return out;
  }
  return undefined;
}

/** Deduce acción legible y entidad a partir de la ruta: PATCH /crm/oportunidades/:id → crm/oportunidades.editar. */
export function describirRuta(metodo: string, ruta: string) {
  const partes = ruta.split('?')[0].split('/').filter(Boolean);
  const recurso = partes.filter((p) => !ID.test(p));
  const entidadId = [...partes].reverse().find((p) => ID.test(p)) ?? null;
  const ultimo = partes[partes.length - 1];
  const hayIdAntes = partes.slice(0, -1).some((p) => ID.test(p));
  let verbo = VERBO[metodo] ?? metodo.toLowerCase();
  let base = recurso;
  if (metodo === 'POST' && hayIdAntes && !ID.test(ultimo)) { verbo = ultimo; base = recurso.slice(0, -1); }
  else if (metodo === 'GET') { verbo = 'exportar'; if (/(export|csv|descargar)/i.test(ultimo) && base.length > 1) base = base.slice(0, -1); }
  return { accion: `${base.join('/') || 'sistema'}.${verbo}`, entidad: base[0] ?? null, entidadId };
}

/**
 * Bitácora automática de todo el sistema: cada cambio (POST/PUT/PATCH/DELETE) y cada exportación hecha por un usuario con sesión
 * queda registrada con quién, qué, en qué marca, desde qué IP/dispositivo y qué datos envió. Nunca interrumpe la operación.
 */
@Injectable()
export class ActividadInterceptor implements NestInterceptor {
  constructor(private readonly actividad: ActividadService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();
    const req = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const ruta = (req.originalUrl ?? req.url ?? '').split('?')[0].replace(/^\/+/, '');
    const esCambio = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    const esExport = req.method === 'GET' && /(export|csv|descargar)/i.test(ruta);
    if (!req.user || (!esCambio && !esExport) || OMITIR.some((o) => ruta === o || ruta.startsWith(`${o}/`))) return next.handle();

    return next.handle().pipe(
      tap(() => {
        try {
          const { accion, entidad, entidadId } = describirRuta(req.method, ruta);
          const cabMarca = req.headers['x-marca-id'];
          const marcaId = typeof cabMarca === 'string' && req.user!.marcas.some((m) => m.marcaId === cabMarca) ? cabMarca : null;
          let cambios: unknown = esCambio && req.body && typeof req.body === 'object' ? limpiarCambios(req.body) : undefined;
          if (cambios && JSON.stringify(cambios).length > MAX_JSON) cambios = { truncado: true, campos: Object.keys(req.body as object) };
          if (cambios && typeof cambios === 'object' && !Object.keys(cambios).length) cambios = undefined;
          const forwarded = req.headers['x-forwarded-for'];
          const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : undefined) || req.ip || null;
          void this.actividad.registrar({
            usuarioId: req.user!.sub, email: req.user!.email, accion, marcaId, entidad, entidadId, metodo: req.method, ruta: `/${ruta}`,
            ip, dispositivo: String(req.headers['user-agent'] ?? '').slice(0, 200) || null, cambios,
          });
        } catch { /* la bitácora nunca rompe la petición */ }
      }),
    );
  }
}
