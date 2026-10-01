import { describe, expect, it } from 'vitest';
import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { SuperAdminGuard } from './super-admin.guard.js';

const ctx = (user: unknown) => ({ switchToHttp: () => ({ getRequest: () => ({ user }) }) }) as unknown as ExecutionContext;
const guard = () => new SuperAdminGuard({ marca: { findMany: async () => [{ id: 'a' }, { id: 'b' }] } } as never);

describe('SuperAdminGuard', () => {
  it('deja pasar a quien es admin de todas las marcas', async () => {
    await expect(guard().canActivate(ctx({ marcas: [{ marcaId: 'a', rol: 'admin' }, { marcaId: 'b', rol: 'admin' }] }))).resolves.toBe(true);
  });

  it('rechaza al admin de una sola marca, a quien tiene otro rol y a la sesión vacía', async () => {
    await expect(guard().canActivate(ctx({ marcas: [{ marcaId: 'a', rol: 'admin' }] }))).rejects.toThrow(ForbiddenException);
    await expect(guard().canActivate(ctx({ marcas: [{ marcaId: 'a', rol: 'admin' }, { marcaId: 'b', rol: 'ventas' }] }))).rejects.toThrow(ForbiddenException);
    await expect(guard().canActivate(ctx(undefined))).rejects.toThrow(ForbiddenException);
  });
});
