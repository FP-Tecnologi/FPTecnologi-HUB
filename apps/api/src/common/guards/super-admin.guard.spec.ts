import { describe, expect, it } from 'vitest';
import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { SuperAdminGuard } from './super-admin.guard.js';

const ctx = (user: unknown) => ({ switchToHttp: () => ({ getRequest: () => ({ user }) }) }) as unknown as ExecutionContext;
const guard = (fila: { superAdmin: boolean; activo: boolean } | null) => new SuperAdminGuard({ usuario: { findUnique: async () => fila } } as never);

describe('SuperAdminGuard', () => {
  it('deja pasar solo a quien tiene la marca de super administrador y la cuenta activa', async () => {
    await expect(guard({ superAdmin: true, activo: true }).canActivate(ctx({ sub: 'u1' }))).resolves.toBe(true);
  });

  it('rechaza al admin de marca (aunque lo sea de todas), a la cuenta desactivada y a la sesión vacía', async () => {
    await expect(guard({ superAdmin: false, activo: true }).canActivate(ctx({ sub: 'u1', marcas: [{ marcaId: 'a', rol: 'admin' }] }))).rejects.toThrow(ForbiddenException);
    await expect(guard({ superAdmin: true, activo: false }).canActivate(ctx({ sub: 'u1' }))).rejects.toThrow(ForbiddenException);
    await expect(guard(null).canActivate(ctx({ sub: 'u1' }))).rejects.toThrow(ForbiddenException);
    await expect(guard({ superAdmin: true, activo: true }).canActivate(ctx(undefined))).rejects.toThrow(ForbiddenException);
  });
});
