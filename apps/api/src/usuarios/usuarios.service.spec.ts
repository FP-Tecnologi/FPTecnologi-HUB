import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from './usuarios.service.js';

describe('UsuariosService.updatePerfil', () => {
  let service: UsuariosService;
  let prisma: {
    usuario: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
    usuarioMarcaRol: { findFirst: ReturnType<typeof vi.fn> };
    totpBackupCode: { deleteMany: ReturnType<typeof vi.fn> };
    refreshToken: { updateMany: ReturnType<typeof vi.fn> };
  };
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('correct-password', 10);
  });

  beforeEach(() => {
    prisma = {
      usuario: { findUnique: vi.fn(), update: vi.fn() },
      usuarioMarcaRol: { findFirst: vi.fn() },
      totpBackupCode: { deleteMany: vi.fn() },
      refreshToken: { updateMany: vi.fn() },
    };
    service = new UsuariosService(prisma as never);
  });

  const baseUser = () => ({ id: 'u1', email: 'a@b.com', nombre: 'Ana', passwordHash, activo: true });

  it('updates the nombre and returns the updated user', async () => {
    prisma.usuario.findUnique.mockResolvedValue(baseUser());
    prisma.usuario.update.mockResolvedValue({ id: 'u1', email: 'a@b.com', nombre: 'Ana Nueva' });

    const result = await service.updatePerfil('u1', { nombre: '  Ana Nueva  ' });

    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { nombre: 'Ana Nueva' },
      select: { id: true, email: true, nombre: true, avatarUrl: true, dni: true, telefono: true, cargo: true },
    });
    expect(result).toEqual({ id: 'u1', email: 'a@b.com', nombre: 'Ana Nueva' });
  });

  it('rejects an empty update', async () => {
    await expect(service.updatePerfil('u1', {})).rejects.toThrow(BadRequestException);
    expect(prisma.usuario.findUnique).not.toHaveBeenCalled();
  });

  it('changes the email normalized when the current password is confirmed', async () => {
    prisma.usuario.findUnique
      .mockResolvedValueOnce(baseUser()) // self
      .mockResolvedValueOnce(null); // not taken
    prisma.usuario.update.mockResolvedValue({ id: 'u1', email: 'new@b.com', nombre: 'Ana' });

    const result = await service.updatePerfil('u1', {
      email: '  New@B.com ',
      currentPassword: 'correct-password',
    });

    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { email: 'new@b.com' },
      select: { id: true, email: true, nombre: true, avatarUrl: true, dni: true, telefono: true, cargo: true },
    });
    expect(result.email).toBe('new@b.com');
  });

  it('requires the current password to change the email', async () => {
    prisma.usuario.findUnique.mockResolvedValue(baseUser());

    await expect(service.updatePerfil('u1', { email: 'new@b.com' })).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.usuario.update).not.toHaveBeenCalled();
  });

  it('rejects a wrong current password', async () => {
    prisma.usuario.findUnique.mockResolvedValue(baseUser());

    await expect(
      service.updatePerfil('u1', { email: 'new@b.com', currentPassword: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(prisma.usuario.update).not.toHaveBeenCalled();
  });

  it('rejects an email already taken by another user', async () => {
    prisma.usuario.findUnique
      .mockResolvedValueOnce(baseUser())
      .mockResolvedValueOnce({ id: 'u2', email: 'taken@b.com' });

    await expect(
      service.updatePerfil('u1', { email: 'taken@b.com', currentPassword: 'correct-password' }),
    ).rejects.toThrow(ConflictException);
    expect(prisma.usuario.update).not.toHaveBeenCalled();
  });

  it('treats setting the same email as a no-op (no password needed)', async () => {
    prisma.usuario.findUnique.mockResolvedValue(baseUser());
    prisma.usuario.update.mockResolvedValue({ id: 'u1', email: 'a@b.com', nombre: 'Ana' });

    await service.updatePerfil('u1', { email: 'A@B.com' });

    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: {},
      select: { id: true, email: true, nombre: true, avatarUrl: true, dni: true, telefono: true, cargo: true },
    });
  });

  it('rejects unknown or inactive users', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    await expect(service.updatePerfil('u1', { nombre: 'X' })).rejects.toThrow(NotFoundException);
  });

  describe('reset2fa (admin)', () => {
    it('disables TOTP, clears backup codes and revokes sessions', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 'u9', email: 'bloq@b.com' });
      prisma.usuarioMarcaRol.findFirst.mockResolvedValue({ usuarioId: 'u9', marcaId: 'm1' });

      const result = await service.reset2fa('m1', 'Bloq@B.com');

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({ where: { email: 'bloq@b.com' } });
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'u9' },
        data: { totpEnabled: false, totpSecret: null },
      });
      expect(prisma.totpBackupCode.deleteMany).toHaveBeenCalledWith({ where: { usuarioId: 'u9' } });
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { usuarioId: 'u9', revoked: false },
        data: { revoked: true },
      });
      expect(result).toEqual({ reset: true, email: 'bloq@b.com' });
    });

    it('rejects unknown users', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.reset2fa('m1', 'nadie@b.com')).rejects.toThrow(NotFoundException);
      expect(prisma.usuario.update).not.toHaveBeenCalled();
    });

    it('rejects users from another marca', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 'u9', email: 'bloq@b.com' });
      prisma.usuarioMarcaRol.findFirst.mockResolvedValue(null);

      await expect(service.reset2fa('otra', 'bloq@b.com')).rejects.toThrow(NotFoundException);
      expect(prisma.usuario.update).not.toHaveBeenCalled();
    });
  });
});
