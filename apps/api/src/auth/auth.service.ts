import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import type { AppConfig } from '../config/configuration.js';
import { OtpProposito } from '../generated/prisma/enums.js';

const OTP_LENGTH = 6;
const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(email: string, password: string, nombre?: string) {
    const existing = await this.prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const usuario = await this.prisma.usuario.create({
      data: { email, passwordHash, nombre },
    });

    return { id: usuario.id, email: usuario.email, nombre: usuario.nombre };
  }

  /** Step 1 of login: validates credentials, then issues + emails an OTP code (2FA). */
  async login(email: string, password: string): Promise<{ requiresOtp: true; email: string }> {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordOk = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.issueOtp(usuario.id, usuario.email, OtpProposito.LOGIN_2FA);
    return { requiresOtp: true, email: usuario.email };
  }

  async requestOtp(email: string): Promise<{ requiresOtp: true }> {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    // No revelamos si el correo existe o no para evitar enumeración de usuarios.
    if (usuario && usuario.activo) {
      await this.issueOtp(usuario.id, usuario.email, OtpProposito.LOGIN_2FA);
    }
    return { requiresOtp: true };
  }

  /** Step 2 of login: validates the OTP code and issues access + refresh tokens. */
  async verifyOtp(email: string, codigo: string) {
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

    return this.issueTokens(usuario.id, usuario.email, usuario.marcas.map((m) => ({ marcaId: m.marcaId, rol: m.rol.nombre })));
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

    return this.issueTokens(usuario.id, usuario.email, usuario.marcas.map((m) => ({ marcaId: m.marcaId, rol: m.rol.nombre })));
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

  private async issueOtp(usuarioId: string, email: string, proposito: OtpProposito): Promise<void> {
    const otpConfig = this.configService.get<AppConfig['otp']>('otp')!;
    const codigo = randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0');
    const codigoHash = await bcrypt.hash(codigo, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + otpConfig.expiresInMinutes * 60 * 1000);

    await this.prisma.otpCode.create({
      data: { usuarioId, codigoHash, proposito, expiresAt },
    });

    await this.mailService.sendOtpCode(email, codigo);
  }

  private async issueTokens(
    usuarioId: string,
    email: string,
    marcas: { marcaId: string; rol: string }[],
  ) {
    const jwtConfig = this.configService.get<AppConfig['jwt']>('jwt')!;
    const payload = { sub: usuarioId, email, marcas };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConfig.accessSecret,
      expiresIn: jwtConfig.accessExpiresIn,
    } as JwtSignOptions);
    const refreshToken = await this.jwtService.signAsync(
      { sub: usuarioId, email },
      { secret: jwtConfig.refreshSecret, expiresIn: jwtConfig.refreshExpiresIn } as JwtSignOptions,
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    const expiresAt = this.parseExpiryToDate(jwtConfig.refreshExpiresIn);
    await this.prisma.refreshToken.create({
      data: { usuarioId, tokenHash: refreshTokenHash, expiresAt },
    });

    return { accessToken, refreshToken, marcas };
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
