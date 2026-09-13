import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { generateSecret, generateURI, verify as verifyTotp } from 'otplib';
import * as QRCode from 'qrcode';
import { randomBytes, randomInt } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { normalizeEmail } from '../common/utils/normalize-email.js';
import type { AppConfig } from '../config/configuration.js';
import { OtpProposito } from '../generated/prisma/enums.js';

const OTP_LENGTH = 6;
const SALT_ROUNDS = 10;
const ROL_CLIENTE = 'cliente';
const TOTP_ISSUER = 'FPTecnologi';
const BACKUP_CODE_COUNT = 8;
const DEVICE_TRUST_DAYS = 30;
/** Allows the code from 1 step before/after (30s each) to tolerate clock drift between phone and server. */
const TOTP_EPOCH_TOLERANCE = 30;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Public self-registration — ecommerce customers only. Always lands on
   * the "cliente" role for the given marca; creating staff accounts is an
   * admin-only action (RolesService.crearUsuarioEnMarca), never this.
   */
  async register(email: string, password: string, marcaId: string, nombre?: string) {
    email = normalizeEmail(email);
    const existing = await this.prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const marca = await this.prisma.marca.findUnique({ where: { id: marcaId } });
    if (!marca) {
      throw new BadRequestException('Marca no encontrada');
    }
    const rolCliente = await this.prisma.rol.findUnique({ where: { nombre: ROL_CLIENTE } });
    if (!rolCliente) {
      throw new BadRequestException('El rol "cliente" no está configurado todavía');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const usuario = await this.prisma.usuario.create({
      data: {
        email,
        passwordHash,
        nombre,
        marcas: { create: { marcaId, rolId: rolCliente.id } },
      },
    });

    await this.mailService.sendWelcome(usuario.email, usuario.nombre);

    return { id: usuario.id, email: usuario.email, nombre: usuario.nombre };
  }

  /** Step 1 of forgot-password: emails a reset code if the account exists (anti-enumeration: same response either way). */
  async requestPasswordReset(email: string): Promise<{ sent: true }> {
    email = normalizeEmail(email);
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (usuario && usuario.activo) {
      await this.issueOtp(usuario.id, usuario.email, OtpProposito.RESET_PASSWORD, (e, c) =>
        this.mailService.sendPasswordResetCode(e, c),
      );
    }
    return { sent: true };
  }

  /** Step 2: validates the reset code, sets the new password, and revokes every existing session. */
  async confirmPasswordReset(email: string, codigo: string, newPassword: string): Promise<void> {
    email = normalizeEmail(email);
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      throw new UnauthorizedException('Código inválido o vencido');
    }

    const otp = await this.prisma.otpCode.findFirst({
      where: { usuarioId: usuario.id, consumedAt: null, proposito: OtpProposito.RESET_PASSWORD },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp || otp.expiresAt < new Date()) {
      throw new UnauthorizedException('Código inválido o vencido');
    }
    const codigoOk = await bcrypt.compare(codigo, otp.codigoHash);
    if (!codigoOk) {
      throw new UnauthorizedException('Código inválido o vencido');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.usuario.update({ where: { id: usuario.id }, data: { passwordHash } }),
      this.prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } }),
      // Changing the password invalidates every session that was issued
      // under the old one — otherwise a stolen refresh token would survive
      // a password reset meant to shut it out.
      this.prisma.refreshToken.updateMany({ where: { usuarioId: usuario.id, revoked: false }, data: { revoked: true } }),
      // Un dispositivo "confiable" saltea el 2FA — si alguien más tenía uno
      // con la contraseña vieja, debe volver a pasar por el 2FA completo.
      this.prisma.dispositivoConfiable.updateMany({ where: { usuarioId: usuario.id, revoked: false }, data: { revoked: true } }),
    ]);

    await this.mailService.sendPasswordChanged(usuario.email);
  }

  /**
   * Step 1 of login: validates credentials, then triggers whichever second
   * factor the user has set up — TOTP (app autenticadora) if enabled,
   * otherwise the email OTP code as before. If the caller presents a valid
   * "trusted device" token for this user, the 2FA step is skipped entirely
   * and tokens are issued right away.
   */
  async login(
    email: string,
    password: string,
    deviceToken?: string,
  ) {
    email = normalizeEmail(email);
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: { marcas: { include: { rol: true } } },
    });
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordOk = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (deviceToken && (await this.isTrustedDevice(usuario.id, deviceToken))) {
      return this.issueTokens(usuario, usuario.marcas.map((m) => ({ marcaId: m.marcaId, rol: m.rol.nombre })));
    }

    if (usuario.totpEnabled) {
      return { requiresTotp: true as const, email: usuario.email };
    }

    await this.issueOtp(usuario.id, usuario.email, OtpProposito.LOGIN_2FA, (e, c) =>
      this.mailService.sendOtpCode(e, c),
    );
    return { requiresOtp: true as const, email: usuario.email };
  }

  async requestOtp(email: string): Promise<{ requiresOtp: true }> {
    email = normalizeEmail(email);
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    // No revelamos si el correo existe o no para evitar enumeración de usuarios.
    if (usuario && usuario.activo) {
      await this.issueOtp(usuario.id, usuario.email, OtpProposito.LOGIN_2FA, (e, c) =>
        this.mailService.sendOtpCode(e, c),
      );
    }
    return { requiresOtp: true };
  }

  /** Step 2 of login: validates the OTP code and issues access + refresh tokens. */
  async verifyOtp(email: string, codigo: string, trustDevice = false) {
    email = normalizeEmail(email);
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: { marcas: { include: { rol: true } } },
    });
    if (!usuario) {
      throw new UnauthorizedException('Código inválido o vencido');
    }

    const otp = await this.prisma.otpCode.findFirst({
      where: { usuarioId: usuario.id, consumedAt: null, proposito: OtpProposito.LOGIN_2FA },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new UnauthorizedException('Código inválido o vencido');
    }

    const codigoOk = await bcrypt.compare(codigo, otp.codigoHash);
    if (!codigoOk) {
      throw new UnauthorizedException('Código inválido o vencido');
    }

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });

    const tokens = await this.issueTokens(usuario, usuario.marcas.map((m) => ({ marcaId: m.marcaId, rol: m.rol.nombre })));
    const deviceToken = trustDevice ? await this.issueTrustedDevice(usuario.id) : undefined;
    return { ...tokens, deviceToken };
  }

  /** Step 2 of login when TOTP is enabled: verifies the app code (or a backup code) and issues tokens. */
  async verifyTotpLogin(email: string, code: string, trustDevice = false) {
    email = normalizeEmail(email);
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: { marcas: { include: { rol: true } } },
    });
    if (!usuario || !usuario.totpEnabled || !usuario.totpSecret) {
      throw new UnauthorizedException('Código inválido');
    }

    const valid = await this.verifyTotpOrBackupCode(usuario.id, usuario.totpSecret, code);
    if (!valid) {
      throw new UnauthorizedException('Código inválido');
    }

    const tokens = await this.issueTokens(usuario, usuario.marcas.map((m) => ({ marcaId: m.marcaId, rol: m.rol.nombre })));
    const deviceToken = trustDevice ? await this.issueTrustedDevice(usuario.id) : undefined;
    return { ...tokens, deviceToken };
  }

  /** Logs in (or silently registers, cliente role) via a verified Google account — no 2FA step, Google already is the strong factor. */
  async loginOrRegisterGoogle(email: string, nombre: string | null, marcaId?: string) {
    email = normalizeEmail(email);
    let usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: { marcas: { include: { rol: true } } },
    });

    if (!usuario) {
      if (!marcaId) {
        throw new BadRequestException('Falta indicar la marca para crear la cuenta');
      }
      const marca = await this.prisma.marca.findUnique({ where: { id: marcaId } });
      if (!marca) {
        throw new BadRequestException('Marca no encontrada');
      }
      const rolCliente = await this.prisma.rol.findUnique({ where: { nombre: ROL_CLIENTE } });
      if (!rolCliente) {
        throw new BadRequestException('El rol "cliente" no está configurado todavía');
      }
      // Cuenta sin contraseña de verdad — solo entra por Google, hasta que
      // pida "olvidé mi contraseña" y se ponga una real.
      const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), SALT_ROUNDS);
      const created = await this.prisma.usuario.create({
        data: { email, passwordHash, nombre, marcas: { create: { marcaId, rolId: rolCliente.id } } },
        include: { marcas: { include: { rol: true } } },
      });
      await this.mailService.sendWelcome(created.email, created.nombre);
      usuario = created;
    } else if (!usuario.activo) {
      throw new UnauthorizedException('Cuenta inactiva');
    }

    return this.issueTokens(usuario, usuario.marcas.map((m) => ({ marcaId: m.marcaId, rol: m.rol.nombre })));
  }

  /** Generates a 30-day "trust this device" token, hashed at rest like refresh tokens. */
  private async issueTrustedDevice(usuarioId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + DEVICE_TRUST_DAYS * 24 * 60 * 60 * 1000);
    await this.prisma.dispositivoConfiable.create({ data: { usuarioId, tokenHash, expiresAt } });
    return token;
  }

  private async isTrustedDevice(usuarioId: string, token: string): Promise<boolean> {
    const candidates = await this.prisma.dispositivoConfiable.findMany({
      where: { usuarioId, revoked: false, expiresAt: { gt: new Date() } },
    });
    return (await this.findMatchingToken(candidates, token)) !== undefined;
  }

  /** Generates a TOTP secret + QR for the user to scan. Not active until enableTotp() confirms a code. */
  async setupTotp(usuarioId: string): Promise<{ secret: string; otpauthUrl: string; qrCodeDataUrl: string }> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    if (usuario.totpEnabled) {
      throw new BadRequestException('El 2FA por app ya está activado — desactívalo antes de reconfigurar');
    }

    const secret = generateSecret();
    await this.prisma.usuario.update({ where: { id: usuarioId }, data: { totpSecret: secret } });

    const otpauthUrl = generateURI({ issuer: TOTP_ISSUER, label: usuario.email, secret });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return { secret, otpauthUrl, qrCodeDataUrl };
  }

  /** Confirms setupTotp() with a real code from the app, activates 2FA, and returns one-time backup codes. */
  async enableTotp(usuarioId: string, code: string): Promise<{ backupCodes: string[] }> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario?.totpSecret) {
      throw new BadRequestException('Primero llama a /auth/totp/setup');
    }

    const valid = await this.safeVerifyTotp(usuario.totpSecret, code);
    if (!valid) {
      throw new UnauthorizedException('Código inválido');
    }

    // Hash all codes first (real async work) so the $transaction array below
    // only holds un-awaited Prisma operation promises — awaiting each one
    // individually before building that array would run it outside the
    // transaction instead of as part of it.
    const backupCodes = Array.from({ length: BACKUP_CODE_COUNT }, () =>
      randomBytes(5).toString('hex').toUpperCase(),
    );
    const hashedCodes = await Promise.all(backupCodes.map((plain) => bcrypt.hash(plain, SALT_ROUNDS)));

    await this.prisma.$transaction([
      this.prisma.usuario.update({ where: { id: usuarioId }, data: { totpEnabled: true } }),
      this.prisma.totpBackupCode.deleteMany({ where: { usuarioId } }),
      ...hashedCodes.map((codigoHash) =>
        this.prisma.totpBackupCode.create({ data: { usuarioId, codigoHash } }),
      ),
    ]);

    return { backupCodes };
  }

  /** Requires a valid TOTP/backup code (not the password) so a stolen access token alone can't turn 2FA off. */
  async disableTotp(usuarioId: string, code: string): Promise<void> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario?.totpEnabled || !usuario.totpSecret) {
      throw new BadRequestException('El 2FA por app no está activado');
    }

    const valid = await this.verifyTotpOrBackupCode(usuarioId, usuario.totpSecret, code);
    if (!valid) {
      throw new UnauthorizedException('Código inválido');
    }

    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { totpEnabled: false, totpSecret: null },
      }),
      this.prisma.totpBackupCode.deleteMany({ where: { usuarioId } }),
    ]);
  }

  /** Accepts either the live 6-digit app code or a one-time backup code (consumed on use). */
  private async verifyTotpOrBackupCode(usuarioId: string, secret: string, code: string): Promise<boolean> {
    if (await this.safeVerifyTotp(secret, code)) {
      return true;
    }

    const backupCodes = await this.prisma.totpBackupCode.findMany({
      where: { usuarioId, usedAt: null },
    });
    for (const backup of backupCodes) {
      if (await bcrypt.compare(code, backup.codigoHash)) {
        await this.prisma.totpBackupCode.update({ where: { id: backup.id }, data: { usedAt: new Date() } });
        return true;
      }
    }
    return false;
  }

  /**
   * otplib's verify() throws (doesn't return false) for a malformed token —
   * e.g. a 10-char backup code instead of a 6-digit TOTP would 500 the
   * request instead of just failing validation. Swallow that and treat any
   * non-TOTP-shaped input as simply invalid.
   */
  private async safeVerifyTotp(secret: string, code: string): Promise<boolean> {
    try {
      const { valid } = await verifyTotp({ secret, token: code, epochTolerance: TOTP_EPOCH_TOLERANCE });
      return valid;
    } catch {
      return false;
    }
  }

  async refresh(refreshToken: string) {
    const jwtConfig = this.configService.get<AppConfig['jwt']>('jwt')!;
    let payload: { sub: string; email: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, { secret: jwtConfig.refreshSecret });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const stored = await this.prisma.refreshToken.findMany({
      where: { usuarioId: payload.sub, revoked: false, expiresAt: { gt: new Date() } },
    });
    const match = await this.findMatchingToken(stored, refreshToken);
    if (!match) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    await this.prisma.refreshToken.update({ where: { id: match.id }, data: { revoked: true } });

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: { marcas: { include: { rol: true } } },
    });
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return this.issueTokens(usuario, usuario.marcas.map((m) => ({ marcaId: m.marcaId, rol: m.rol.nombre })));
  }

  async logout(usuarioId: string, refreshToken: string): Promise<void> {
    const stored = await this.prisma.refreshToken.findMany({
      where: { usuarioId, revoked: false },
    });
    const match = await this.findMatchingToken(stored, refreshToken);
    if (match) {
      await this.prisma.refreshToken.update({ where: { id: match.id }, data: { revoked: true } });
    }
  }

  private async issueOtp(
    usuarioId: string,
    email: string,
    proposito: OtpProposito,
    sendMail: (email: string, codigo: string) => Promise<void>,
  ): Promise<void> {
    const otpConfig = this.configService.get<AppConfig['otp']>('otp')!;
    const codigo = randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0');
    const codigoHash = await bcrypt.hash(codigo, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + otpConfig.expiresInMinutes * 60 * 1000);

    await this.prisma.otpCode.create({
      data: { usuarioId, codigoHash, proposito, expiresAt },
    });

    await sendMail(email, codigo);
  }

  private async issueTokens(
    usuario: { id: string; email: string; nombre: string | null },
    marcas: { marcaId: string; rol: string }[],
  ) {
    const jwtConfig = this.configService.get<AppConfig['jwt']>('jwt')!;
    const payload = { sub: usuario.id, email: usuario.email, marcas };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConfig.accessSecret,
      expiresIn: jwtConfig.accessExpiresIn,
    } as JwtSignOptions);
    const refreshToken = await this.jwtService.signAsync(
      { sub: usuario.id, email: usuario.email },
      { secret: jwtConfig.refreshSecret, expiresIn: jwtConfig.refreshExpiresIn } as JwtSignOptions,
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    const expiresAt = this.parseExpiryToDate(jwtConfig.refreshExpiresIn);
    await this.prisma.refreshToken.create({
      data: { usuarioId: usuario.id, tokenHash: refreshTokenHash, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      marcas,
      usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
    };
  }

  private async findMatchingToken<T extends { id: string; tokenHash: string }>(
    candidates: T[],
    refreshToken: string,
  ): Promise<T | undefined> {
    for (const candidate of candidates) {
      if (await bcrypt.compare(refreshToken, candidate.tokenHash)) {
        return candidate;
      }
    }
    return undefined;
  }

  private parseExpiryToDate(expiresIn: string): Date {
    const match = /^(\d+)([smhd])$/.exec(expiresIn.trim());
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    const value = parseInt(match[1], 10);
    const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]]!;
    return new Date(Date.now() + value * unitMs);
  }
}
