import { describe, expect, it } from 'vitest';
import { lastValueFrom, of } from 'rxjs';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { IdempotenciaInterceptor } from './idempotencia.interceptor.js';

const contexto = (req: object) =>
  ({ getType: () => 'http', switchToHttp: () => ({ getRequest: () => req }) }) as unknown as ExecutionContext;

const peticion = (extra: object = {}) => ({
  method: 'POST',
  url: '/crm/empresas',
  headers: { 'idempotency-key': 'k1' },
  user: { sub: 'u1' },
  ...extra,
});

describe('IdempotenciaInterceptor', () => {
  it('ejecuta una vez y devuelve la misma respuesta al repetir la clave', async () => {
    const interceptor = new IdempotenciaInterceptor();
    let ejecuciones = 0;
    const handler: CallHandler = { handle: () => { ejecuciones++; return of({ id: ejecuciones }); } };

    const a = await lastValueFrom(interceptor.intercept(contexto(peticion()), handler));
    const b = await lastValueFrom(interceptor.intercept(contexto(peticion()), handler));

    expect(ejecuciones).toBe(1);
    expect(b).toEqual(a);
  });

  it('sin cabecera, con otra clave o con otro usuario ejecuta de nuevo', async () => {
    const interceptor = new IdempotenciaInterceptor();
    let ejecuciones = 0;
    const handler: CallHandler = { handle: () => { ejecuciones++; return of(ejecuciones); } };

    await lastValueFrom(interceptor.intercept(contexto(peticion()), handler));
    await lastValueFrom(interceptor.intercept(contexto(peticion({ headers: {} })), handler));
    await lastValueFrom(interceptor.intercept(contexto(peticion({ headers: { 'idempotency-key': 'k2' } })), handler));
    await lastValueFrom(interceptor.intercept(contexto(peticion({ user: { sub: 'u2' } })), handler));

    expect(ejecuciones).toBe(4);
  });

  it('no aplica a GET', async () => {
    const interceptor = new IdempotenciaInterceptor();
    let ejecuciones = 0;
    const handler: CallHandler = { handle: () => { ejecuciones++; return of(ejecuciones); } };

    await lastValueFrom(interceptor.intercept(contexto(peticion({ method: 'GET' })), handler));
    await lastValueFrom(interceptor.intercept(contexto(peticion({ method: 'GET' })), handler));

    expect(ejecuciones).toBe(2);
  });
});
