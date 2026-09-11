import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';

const JWT_CONFIG = {
  accessSecret: 'test-access-secret',
  accessExpiresIn: '15m',
  refreshSecret: 'test-refresh-secret',
  refreshExpiresIn: '7d',
};
const OTP_CONFIG = { expiresInMinutes: 10 };

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    usuario: { findUnique: ReturnType<typeof vi.fn> };
    otpCode: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    refreshToken: { create: ReturnType<typeof vi.fn> };
  };
  let jwtService: { signAsync: ReturnType<typeof vi.fn>; verifyAsync: ReturnType<typeof vi.fn> };
  let mailService: { sendOtpCode: ReturnType<typeof vi.fn> };
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('correct-password', 10);
  });

  beforeEach(() => {
    prisma = {
      usuario: { findUnique: vi.fn() },
      otpCode: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
      refreshToken: { create: vi.fn() },
    };
    jwtService = { signAsync: vi.fn().mockResolvedValue('signed-token'), verifyAsync: vi.fn() };
    mailService = { sendOtpCode: vi.fn().mockResolvedValue(undefined) };
    const configService = {
      get: (key: string) => ({ jwt: JWT_CONFIG, otp: OTP_CONFIG })[key],
    };

    service = new AuthService(
      prisma as never,
      jwtService as never,
      configService as never,
      mailService as never,
    );
  });

  describe('login', () => {
    it('rejects wrong password without revealing which field failed', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        passwordHash,
        activo: true,
      });

      await expect(service.login('a@b.com', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mailService.sendOtpCode).not.toHaveBeenCalled();
    });

    it('rejects inactive users even with the correct password', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        passwordHash,
        activo: false,
      });

      await expect(service.login('a@b.com', 'correct-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('issues and emails an OTP on valid credentials, without returning a token yet', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        passwordHash,
        activo: true,
      });

      const result = await service.login('a@b.com', 'correct-password');

      expect(result).toEqual({ requiresOtp: true, email: 'a@b.com' });
      expect(prisma.otpCode.create).toHaveBeenCalledOnce();
      expect(mailService.sendOtpCode).toHaveBeenCalledWith('a@b.com', expect.any(String));
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    it('rejects an expired code', async () => {
      const codigoHash = await bcrypt.hash('123456', 10);
      prisma.usuario.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com', marcas: [] });
      prisma.otpCode.findFirst.mockResolvedValue({
        id: 'otp1',
        codigoHash,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.verifyOtp('a@b.com', '123456')).rejects.toThrow(UnauthorizedException);
      expect(prisma.otpCode.update).not.toHaveBeenCalled();
    });

    it('rejects a code that does not match the stored hash', async () => {
      const codigoHash = await bcrypt.hash('123456', 10);
      prisma.usuario.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com', marcas: [] });
      prisma.otpCode.findFirst.mockResolvedValue({
        id: 'otp1',
        codigoHash,
        expiresAt: new Date(Date.now() + 60_000),
      });

      await expect(service.verifyOtp('a@b.com', '000000')).rejects.toThrow(UnauthorizedException);
    });

    it('consumes the code and issues tokens scoped to the user marca/rol assignments', async () => {
      const codigoHash = await bcrypt.hash('123456', 10);
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        marcas: [{ marcaId: 'm1', rol: { nombre: 'admin' } }],
      });
      prisma.otpCode.findFirst.mockResolvedValue({
        id: 'otp1',
        codigoHash,
        expiresAt: new Date(Date.now() + 60_000),
      });

      const result = await service.verifyOtp('a@b.com', '123456');

      expect(prisma.otpCode.update).toHaveBeenCalledWith({
        where: { id: 'otp1' },
        data: { consumedAt: expect.any(Date) },
      });
      expect(result.marcas).toEqual([{ marcaId: 'm1', rol: 'admin' }]);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(prisma.refreshToken.create).toHaveBeenCalledOnce();
    });
  });

  describe('refresh', () => {
    it('rejects a refresh token that fails verification', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('bad signature'));

      await expect(service.refresh('garbage')).rejects.toThrow(UnauthorizedException);
    });
  });
});
