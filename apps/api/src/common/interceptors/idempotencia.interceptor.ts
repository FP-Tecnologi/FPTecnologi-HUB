import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface PeticionHttp {
  method: string;
  originalUrl?: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  user?: { id?: string; sub?: string };
}

const METODOS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);
const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ENTRADAS = 5000;

/**
 * Idempotencia para el modo offline del dashboard: la cola de cambios pendientes reenvía cada escritura con la
 * cabecera `Idempotency-Key`. Si la primera vez llegó pero se perdió la respuesta, el reintento devuelve la misma
 * respuesta guardada en vez de duplicar el registro.
 *
 * Se guarda en memoria (24 h, tope de entradas): cubre el caso real (corte de red a mitad de la petición); si el
 * proceso se reinicia entre el envío y el reintento el cambio podría repetirse. Va antes de ResponseInterceptor y
 * ActividadInterceptor para que una repetición tampoco duplique la bitácora.
 */
@Injectable()
export class IdempotenciaInterceptor implements NestInterceptor {
  private readonly respuestas = new Map<string, { en: number; valor: unknown }>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();
    const req = context.switchToHttp().getRequest<PeticionHttp>();
    const cabecera = req.headers['idempotency-key'];
    const clave = Array.isArray(cabecera) ? cabecera[0] : cabecera;
    if (!clave || clave.length > 100 || !METODOS.has(req.method)) return next.handle();

    const usuario = req.user?.id ?? req.user?.sub;
    if (!usuario) return next.handle();
    const id = `${usuario}|${req.method}|${req.originalUrl ?? req.url}|${clave}`;

    this.purgar();
    const guardada = this.respuestas.get(id);
    if (guardada) return of(guardada.valor);

    return next.handle().pipe(tap((valor) => this.respuestas.set(id, { en: Date.now(), valor })));
  }

  private purgar(): void {
    if (this.respuestas.size < MAX_ENTRADAS) return;
    const limite = Date.now() - TTL_MS;
    for (const [k, v] of this.respuestas) if (v.en < limite) this.respuestas.delete(k);
    // Si todo es reciente, descarta las más viejas para no crecer sin límite.
    while (this.respuestas.size >= MAX_ENTRADAS) {
      const primera = this.respuestas.keys().next().value;
      if (primera === undefined) break;
      this.respuestas.delete(primera);
    }
  }
}
