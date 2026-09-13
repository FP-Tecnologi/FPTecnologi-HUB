import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { generate as generateTotp, generateSecret } from 'otplib';
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
    usuario: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
    marca: { findUnique: ReturnType<typeof vi.fn> };
    rol: { findUnique: ReturnType<typeof vi.fn> };
    otpCode: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    totpBackupCode: {
      findMany: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
    refreshToken: { create: ReturnType<typeof vi.fn>; updateMany: ReturnType<typeof vi.fn> };
    dispositivoConfiable: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let jwtService: { signAsync: ReturnType<typeof vi.fn>; verifyAsync: ReturnType<typeof vi.fn> };
  let mailService: {
    sendOtpCode: ReturnType<typeof vi.fn>;
    sendPasswordResetCode: ReturnType<typeof vi.fn>;
    sendWelcome: ReturnType<typeof vi.fn>;
    sendPasswordChanged: ReturnType<typeof vi.fn>;
  };
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('correct-password', 10);
  });

  beforeEach(() => {
    prisma = {
      usuario: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
      marca: { findUnique: vi.fn() },
      rol: { findUnique: vi.fn() },
      otpCode: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
      totpBackupCode: {
        findMany: vi.fn().mockResolvedValue([]),
        update: vi.fn(),
        deleteMany: vi.fn(),
        create: vi.fn(),
      },
      refreshToken: { create: vi.fn(), updateMany: vi.fn() },
      dispositivoConfiable: { create: vi.fn(), findMany: vi.fn().mockResolvedValue([]), updateMany: vi.fn() },
      $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
    };
    jwtService = { signAsync: vi.fn().mockResolvedValue('signed-token'), verifyAsync: vi.fn() };
    mailService = {
      sendOtpCode: vi.fn().mockResolvedValue(undefined),
      sendPasswordResetCode: vi.fn().mockResolvedValue(undefined),
      sendWelcome: vi.fn().mockResolvedValue(undefined),
      sendPasswordChanged: vi.fn().mockResolvedValue(undefined),
    };
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

    it('looks users up case-insensitively (Dev@x == dev@x)', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        passwordHash,
        activo: true,
        marcas: [],
      });

      const result = await service.login('  A@B.com ', 'correct-password');

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: 'a@b.com' },
        include: { marcas: { include: { rol: true } } },
      });
      expect(result).toEqual({ requiresOtp: true, email: 'a@b.com' });
    });

    it('skips 2FA and issues tokens right away when a valid "trusted device" cookie is presented', async () => {
      const tokenHash = await bcrypt.hash('the-raw-device-token', 10);
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        passwordHash,
        activo: true,
        marcas: [{ marcaId: 'm1', rol: { nombre: 'admin' } }],
      });
      prisma.dispositivoConfiable.findMany.mockResolvedValue([
        { id: 'd1', tokenHash, revoked: false, expiresAt: new Date(Date.now() + 60_000) },
      ]);

      const result = await service.login('a@b.com', 'correct-password', 'the-raw-device-token');

      expect(result).not.toHaveProperty('requiresOtp');
      expect(result).not.toHaveProperty('requiresTotp');
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mailService.sendOtpCode).not.toHaveBeenCalled();
    });

    it('falls back to normal 2FA when the device cookie does not match any stored token', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        passwordHash,
        activo: true,
        marcas: [],
      });
      prisma.dispositivoConfiable.findMany.mockResolvedValue([]);

      const result = await service.login('a@b.com', 'correct-password', 'not-a-real-token');

      expect(result).toEqual({ requiresOtp: true, email: 'a@b.com' });
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
        nombre: 'Ana',
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
      // Regression guard: issueTokens used to drop `usuario` entirely, so the
      // dashboard's `result.usuario` (AuthContext.tsx) was always undefined.
      expect(result.usuario).toEqual({ id: 'u1', email: 'a@b.com', nombre: 'Ana', avatarUrl: null });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(prisma.refreshToken.create).toHaveBeenCalledOnce();
    });

    it('stores a hashed "trusted device" token and returns the raw one only when trustDevice is true', async () => {
      const codigoHash = await bcrypt.hash('123456', 10);
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        nombre: 'Ana',
        marcas: [],
      });
      prisma.otpCode.findFirst.mockResolvedValue({
        id: 'otp1',
        codigoHash,
        expiresAt: new Date(Date.now() + 60_000),
      });

      const result = await service.verifyOtp('a@b.com', '123456', true);

      expect(result.deviceToken).toEqual(expect.any(String));
      expect(prisma.dispositivoConfiable.create).toHaveBeenCalledWith({
        data: { usuarioId: 'u1', tokenHash: expect.any(String), expiresAt: expect.any(Date) },
      });
      // The stored hash must not equal the raw token handed back to the caller.
      expect(prisma.dispositivoConfiable.create.mock.calls[0][0].data.tokenHash).not.toBe(result.deviceToken);
    });

    it('does not create a trusted-device row when trustDevice is not requested', async () => {
      const codigoHash = await bcrypt.hash('123456', 10);
      prisma.usuario.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com', nombre: 'Ana', marcas: [] });
      prisma.otpCode.findFirst.mockResolvedValue({ id: 'otp1', codigoHash, expiresAt: new Date(Date.now() + 60_000) });

      const result = await service.verifyOtp('a@b.com', '123456');

      expect(result.deviceToken).toBeUndefined();
      expect(prisma.dispositivoConfiable.create).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('rejects a refresh token that fails verification', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('bad signature'));

      await expect(service.refresh('garbage')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login with TOTP enabled', () => {
    it('asks for the app code instead of emailing an OTP', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        passwordHash,
        activo: true,
        totpEnabled: true,
      });

      const result = await service.login('a@b.com', 'correct-password');

      expect(result).toEqual({ requiresTotp: true, email: 'a@b.com' });
      expect(mailService.sendOtpCode).not.toHaveBeenCalled();
      expect(prisma.otpCode.create).not.toHaveBeenCalled();
    });
  });

  describe('verifyTotpLogin', () => {
    it('rejects a wrong code', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        totpEnabled: true,
        totpSecret: generateSecret(),
        marcas: [],
      });

      await expect(service.verifyTotpLogin('a@b.com', '000000')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('issues tokens for a valid app code', async () => {
      const secret = generateSecret();
      const token = await generateTotp({ secret });
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        totpEnabled: true,
        totpSecret: secret,
        marcas: [{ marcaId: 'm1', rol: { nombre: 'admin' } }],
      });

      const result = await service.verifyTotpLogin('a@b.com', token);

      expect(result.marcas).toEqual([{ marcaId: 'm1', rol: 'admin' }]);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('accepts an unused backup code exactly once', async () => {
      const secret = generateSecret();
      const backupHash = await bcrypt.hash('ABCD1234EF', 10);
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        totpEnabled: true,
        totpSecret: secret,
        marcas: [],
      });
      prisma.totpBackupCode.findMany.mockResolvedValue([
        { id: 'bc1', codigoHash: backupHash, usedAt: null },
      ]);

      const result = await service.verifyTotpLogin('a@b.com', 'ABCD1234EF');

      expect(result.marcas).toEqual([]);
      expect(prisma.totpBackupCode.update).toHaveBeenCalledWith({
        where: { id: 'bc1' },
        data: { usedAt: expect.any(Date) },
      });
    });
  });

  describe('enableTotp', () => {
    it('rejects enabling before setupTotp() has stored a secret', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 'u1', totpSecret: null });

      await expect(service.enableTotp('u1', '123456')).rejects.toThrow(BadRequestException);
    });

    it('rejects a wrong confirmation code and does not enable 2FA', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 'u1', totpSecret: generateSecret() });

      await expect(service.enableTotp('u1', '000000')).rejects.toThrow(UnauthorizedException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('activates 2FA and returns 8 one-time backup codes on a valid code', async () => {
      const secret = generateSecret();
      const token = await generateTotp({ secret });
      prisma.usuario.findUnique.mockResolvedValue({ id: 'u1', totpSecret: secret });

      const result = await service.enableTotp('u1', token);

      expect(result.backupCodes).toHaveLength(8);
      expect(new Set(result.backupCodes).size).toBe(8); // no duplicates
      expect(prisma.$transaction).toHaveBeenCalledOnce();
    });
  });

  describe('disableTotp', () => {
    it('refuses to disable without a valid code (a stolen access token alone is not enough)', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u1',
        totpEnabled: true,
        totpSecret: generateSecret(),
      });

      await expect(service.disableTotp('u1', '000000')).rejects.toThrow(UnauthorizedException);
    });

    it('turns off 2FA and clears the secret on a valid code', async () => {
      const secret = generateSecret();
      const token = await generateTotp({ secret });
      prisma.usuario.findUnique.mockResolvedValue({ id: 'u1', totpEnabled: true, totpSecret: secret });

      await service.disableTotp('u1', token);

      expect(prisma.$transaction).toHaveBeenCalledOnce();
    });
  });

  describe('register', () => {
    it('rejects a duplicate email', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.register('a@b.com', 'correct-password', 'm1')).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.usuario.create).not.toHaveBeenCalled();
    });

    it('rejects an unknown marcaId', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.marca.findUnique.mockResolvedValue(null);

      await expect(service.register('a@b.com', 'correct-password', 'bad-marca')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('always lands on the "cliente" role, never an admin/staff one', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.marca.findUnique.mockResolvedValue({ id: 'm1', nombre: 'FPTecnologi' });
      prisma.rol.findUnique.mockResolvedValue({ id: 'rol-cliente', nombre: 'cliente' });
      prisma.usuario.create.mockResolvedValue({ id: 'u1', email: 'a@b.com', nombre: 'Ana' });

      const result = await service.register('a@b.com', 'correct-password', 'm1', 'Ana');

      expect(result).toEqual({ id: 'u1', email: 'a@b.com', nombre: 'Ana' });
      expect(prisma.rol.findUnique).toHaveBeenCalledWith({ where: { nombre: 'cliente' } });
      const createArgs = prisma.usuario.create.mock.calls[0][0];
      expect(createArgs.data.marcas.create).toEqual({ marcaId: 'm1', rolId: 'rol-cliente' });
      expect(await bcrypt.compare('correct-password', createArgs.data.passwordHash)).toBe(true);
    });

    it('stores the email normalized (trimmed + lowercase)', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.marca.findUnique.mockResolvedValue({ id: 'm1', nombre: 'FPTecnologi' });
      prisma.rol.findUnique.mockResolvedValue({ id: 'rol-cliente', nombre: 'cliente' });
      prisma.usuario.create.mockResolvedValue({ id: 'u1', email: 'new@b.com', nombre: 'Ana' });

      await service.register('  New@B.com ', 'correct-password', 'm1', 'Ana');

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({ where: { email: 'new@b.com' } });
      expect(prisma.usuario.create.mock.calls[0][0].data.email).toBe('new@b.com');
    });
  });

  describe('requestPasswordReset / confirmPasswordReset', () => {
    it('emails a reset code for an existing active user', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com', activo: true });

      await service.requestPasswordReset('a@b.com');

      expect(prisma.otpCode.create).toHaveBeenCalledOnce();
      expect(mailService.sendPasswordResetCode).toHaveBeenCalledWith('a@b.com', expect.any(String));
    });

    it('says nothing was sent differently for an unknown email (anti-enumeration)', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      const result = await service.requestPasswordReset('nobody@b.com');

      expect(result).toEqual({ sent: true });
      expect(mailService.sendPasswordResetCode).not.toHaveBeenCalled();
    });

    it('rejects an expired reset code', async () => {
      const codigoHash = await bcrypt.hash('123456', 10);
      prisma.usuario.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
      prisma.otpCode.findFirst.mockResolvedValue({
        id: 'otp1',
        codigoHash,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.confirmPasswordReset('a@b.com', '123456', 'new-password')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.usuario.update).not.toHaveBeenCalled();
    });

    it('sets the new password and revokes every existing session on a valid code', async () => {
      const codigoHash = await bcrypt.hash('123456', 10);
      prisma.usuario.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
      prisma.otpCode.findFirst.mockResolvedValue({
        id: 'otp1',
        codigoHash,
        expiresAt: new Date(Date.now() + 60_000),
      });

      await service.confirmPasswordReset('a@b.com', '123456', 'new-password');

      const updateArgs = prisma.usuario.update.mock.calls[0][0];
      expect(updateArgs.where).toEqual({ id: 'u1' });
      expect(await bcrypt.compare('new-password', updateArgs.data.passwordHash)).toBe(true);
      expect(prisma.otpCode.update).toHaveBeenCalledWith({
        where: { id: 'otp1' },
        data: { consumedAt: expect.any(Date) },
      });
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { usuarioId: 'u1', revoked: false },
        data: { revoked: true },
      });
      expect(prisma.dispositivoConfiable.updateMany).toHaveBeenCalledWith({
        where: { usuarioId: 'u1', revoked: false },
        data: { revoked: true },
      });
    });
  });

  describe('loginOrRegisterGoogle', () => {
    it('logs an existing user in directly, without touching password or 2FA', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        nombre: 'Ana',
        activo: true,
        marcas: [{ marcaId: 'm1', rol: { nombre: 'admin' } }],
      });

      const result = await service.loginOrRegisterGoogle('A@B.com', 'Ana Google', null);

      expect(prisma.usuario.create).not.toHaveBeenCalled();
      expect(result.usuario).toEqual({ id: 'u1', email: 'a@b.com', nombre: 'Ana', avatarUrl: null });
    });

    it('syncs the Google profile photo onto an existing account that has none yet', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u1', email: 'a@b.com', nombre: 'Ana', activo: true, avatarUrl: null,
        marcas: [{ marcaId: 'm1', rol: { nombre: 'admin' } }],
      });
      prisma.usuario.update.mockResolvedValue({
        id: 'u1', email: 'a@b.com', nombre: 'Ana', avatarUrl: 'https://lh3.googleusercontent.com/foto.jpg',
        marcas: [{ marcaId: 'm1', rol: { nombre: 'admin' } }],
      });

      const result = await service.loginOrRegisterGoogle('a@b.com', 'Ana', 'https://lh3.googleusercontent.com/foto.jpg');

      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { avatarUrl: 'https://lh3.googleusercontent.com/foto.jpg' },
        include: { marcas: { include: { rol: true } } },
      });
      expect(result.usuario.avatarUrl).toBe('https://lh3.googleusercontent.com/foto.jpg');
    });

    it('rejects an inactive account even if the Google email matches', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com', activo: false, marcas: [] });

      await expect(service.loginOrRegisterGoogle('a@b.com', 'Ana', null)).rejects.toThrow(UnauthorizedException);
    });

    it('requires a marcaId to create a brand-new account', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.loginOrRegisterGoogle('new@b.com', 'Ana', null)).rejects.toThrow(BadRequestException);
      expect(prisma.usuario.create).not.toHaveBeenCalled();
    });

    it('creates a new "cliente" account (with an unusable random password) when the email is unknown', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.marca.findUnique.mockResolvedValue({ id: 'm1', nombre: 'FPTecnologi' });
      prisma.rol.findUnique.mockResolvedValue({ id: 'rol-cliente', nombre: 'cliente' });
      prisma.usuario.create.mockResolvedValue({
        id: 'u2',
        email: 'new@b.com',
        nombre: 'Ana',
        avatarUrl: 'https://lh3.googleusercontent.com/foto.jpg',
        marcas: [{ marcaId: 'm1', rol: { nombre: 'cliente' } }],
      });

      const result = await service.loginOrRegisterGoogle('New@B.com', 'Ana', 'https://lh3.googleusercontent.com/foto.jpg', 'm1');

      expect(prisma.usuario.create.mock.calls[0][0].data).toMatchObject({
        email: 'new@b.com',
        nombre: 'Ana',
        avatarUrl: 'https://lh3.googleusercontent.com/foto.jpg',
        marcas: { create: { marcaId: 'm1', rolId: 'rol-cliente' } },
      });
      expect(mailService.sendWelcome).toHaveBeenCalledWith('new@b.com', 'Ana');
      expect(result.usuario).toEqual({
        id: 'u2', email: 'new@b.com', nombre: 'Ana', avatarUrl: 'https://lh3.googleusercontent.com/foto.jpg',
      });
    });
  });
});
