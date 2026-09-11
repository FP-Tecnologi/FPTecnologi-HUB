import { describe, expect, it, vi } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { MarcaRolGuard } from './marca-rol.guard.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';

function makeContext(opts: {
  user?: AuthenticatedUser;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: opts.user,
        headers: opts.headers ?? {},
        query: opts.query ?? {},
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('MarcaRolGuard', () => {
  const user: AuthenticatedUser = {
    sub: 'u1',
    email: 'a@b.com',
    marcas: [{ marcaId: 'm1', rol: 'admin' }],
  };

  it('denies when no marcaId is present (header or query)', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) };
    const guard = new MarcaRolGuard(reflector as never);
    const ctx = makeContext({ user });

    expect(() => guard.canActivate(ctx)).toThrow('No se pudo determinar la marca activa');
  });

  it('denies when the user has no assignment for the requested marca', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) };
    const guard = new MarcaRolGuard(reflector as never);
    const ctx = makeContext({ user, headers: { 'x-marca-id': 'm2' } });

    expect(() => guard.canActivate(ctx)).toThrow('No tienes acceso a esta marca');
  });

  it('denies when @Roles requires a role the user does not have in this marca', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(['marketing']) };
    const guard = new MarcaRolGuard(reflector as never);
    const ctx = makeContext({ user, headers: { 'x-marca-id': 'm1' } });

    expect(() => guard.canActivate(ctx)).toThrow('Tu rol en esta marca no permite esta acción');
  });

  it('allows when the user is assigned to the marca and no roles are required', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) };
    const guard = new MarcaRolGuard(reflector as never);
    const ctx = makeContext({ user, headers: { 'x-marca-id': 'm1' } });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows when the user role matches one of the required @Roles', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(['admin', 'ventas']) };
    const guard = new MarcaRolGuard(reflector as never);
    const ctx = makeContext({ user, query: { marcaId: 'm1' } });

    expect(guard.canActivate(ctx)).toBe(true);
  });
});
