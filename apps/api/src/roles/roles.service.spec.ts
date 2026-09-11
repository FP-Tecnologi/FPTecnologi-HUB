import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as bcrypt from 'bcrypt';
import { RolesService } from './roles.service.js';

describe('RolesService.crearUsuarioEnMarca', () => {
  let service: RolesService;
  let prisma: {
    usuario: { findUnique: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
    usuarioMarcaRol: { upsert: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    prisma = {
      usuario: { findUnique: vi.fn(), create: vi.fn() },
      usuarioMarcaRol: { upsert: vi.fn() },
    };
    service = new RolesService(prisma as never);
  });

  it('creates a new user with a hashed password when the email is unseen', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    prisma.usuario.create.mockResolvedValue({ id: 'u1', email: 'a@b.com', nombre: 'Ana' });

    const result = await service.crearUsuarioEnMarca('m1', {
      email: 'a@b.com',
      password: 'correct-password',
      nombre: 'Ana',
      rolId: 'r1',
    });

    expect(result).toEqual({ id: 'u1', email: 'a@b.com', nombre: 'Ana', nuevo: true });
    const createArgs = prisma.usuario.create.mock.calls[0][0];
    expect(createArgs.data.passwordHash).not.toBe('correct-password'); // never stored in plain text
    expect(await bcrypt.compare('correct-password', createArgs.data.passwordHash)).toBe(true);
    expect(prisma.usuarioMarcaRol.upsert).toHaveBeenCalledWith({
      where: { usuarioId_marcaId_rolId: { usuarioId: 'u1', marcaId: 'm1', rolId: 'r1' } },
      create: { usuarioId: 'u1', marcaId: 'm1', rolId: 'r1' },
      update: {},
    });
  });

  it('reuses an existing user (already works at another marca) instead of creating a duplicate', async () => {
    prisma.usuario.findUnique.mockResolvedValue({ id: 'u2', email: 'existing@b.com', nombre: 'Existing' });

    const result = await service.crearUsuarioEnMarca('m2', {
      email: 'existing@b.com',
      password: 'whatever-password-typed-here',
      rolId: 'r2',
    });

    expect(result).toEqual({ id: 'u2', email: 'existing@b.com', nombre: 'Existing', nuevo: false });
    expect(prisma.usuario.create).not.toHaveBeenCalled();
    expect(prisma.usuarioMarcaRol.upsert).toHaveBeenCalledWith({
      where: { usuarioId_marcaId_rolId: { usuarioId: 'u2', marcaId: 'm2', rolId: 'r2' } },
      create: { usuarioId: 'u2', marcaId: 'm2', rolId: 'r2' },
      update: {},
    });
  });
});
