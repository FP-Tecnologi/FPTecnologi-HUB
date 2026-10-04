import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Limite } from '../common/guards/limite-peticiones.guard.js';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { RequestOtpDto } from './dto/request-otp.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { TotpCodeDto } from './dto/totp-code.dto.js';
import { VerifyTotpLoginDto } from './dto/verify-totp-login.dto.js';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto.js';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto.js';
import { Public } from '../common/decorators/public.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from './types/authenticated-user.js';
import type { GoogleProfile } from './strategies/google.strategy.js';
import type { AppConfig } from '../config/configuration.js';

const DEVICE_COOKIE = 'ax_device';
const DEVICE_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /** Sets the httpOnly "trust this device" cookie only when the caller asked for it and 2FA actually issued one. */
  private applyDeviceCookie(res: Response, deviceToken?: string): void {
    if (!deviceToken) return;
    res.cookie(DEVICE_COOKIE, deviceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: DEVICE_COOKIE_MAX_AGE_MS,
      path: '/',
    });
  }

  // Auto-registro público — SOLO clientes (ecommerce), siempre cae en el
  // rol "cliente" de la marca indicada. Cuentas de equipo/staff las crea
  // un admin desde POST /roles/equipo (ver RolesController), nunca esto.
  @Public()
  @Limite(10)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.marcaId, dto.nombre);
  }

  @Public()
  @Limite(5)
  @HttpCode(HttpStatus.OK)
  @Post('password-reset/request')
  requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Public()
  @Limite(5)
  @HttpCode(HttpStatus.OK)
  @Post('password-reset/confirm')
  confirmPasswordReset(@Body() dto: PasswordResetConfirmDto) {
    return this.authService.confirmPasswordReset(dto.email, dto.codigo, dto.newPassword);
  }

  @Public()
  @Limite(5)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const deviceToken = req.cookies?.[DEVICE_COOKIE] as string | undefined;
    return this.authService.login(dto.email, dto.password, deviceToken);
  }

  @Public()
  @Limite(5)
  @HttpCode(HttpStatus.OK)
  @Post('otp/request')
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto.email);
  }

  @Public()
  @Limite(5)
  @HttpCode(HttpStatus.OK)
  @Post('otp/verify')
  async verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    const { deviceToken, ...result } = await this.authService.verifyOtp(dto.email, dto.codigo, dto.trustDevice);
    this.applyDeviceCookie(res, deviceToken);
    return result;
  }

  @Public()
  @Limite(5)
  @HttpCode(HttpStatus.OK)
  @Post('totp/verify-login')
  async verifyTotpLogin(@Body() dto: VerifyTotpLoginDto, @Res({ passthrough: true }) res: Response) {
    const { deviceToken, ...result } = await this.authService.verifyTotpLogin(dto.email, dto.code, dto.trustDevice);
    this.applyDeviceCookie(res, deviceToken);
    return result;
  }

  /** Kicks off Google OAuth. ?marcaId= is only needed for a NEW account (self sign-up); an existing account ignores it. */
  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth() {
    // El guard redirige a Google antes de llegar acá.
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const webOrigin = this.configService.get<AppConfig['web']>('web')!.origin;
    const marcaId = typeof req.query.state === 'string' && req.query.state ? req.query.state : undefined;
    try {
      const profile = req.user as GoogleProfile;
      const result = await this.authService.loginOrRegisterGoogle(profile.email, profile.nombre, profile.avatarUrl, marcaId);
      const usuario = encodeURIComponent(JSON.stringify(result.usuario));
      res.redirect(
        `${webOrigin}/auth/google/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}&usuario=${usuario}&primeraVez=${result.primeraVez}`,
      );
    } catch (error) {
      this.logger.error('Falló el login con Google', error as Error);
      res.redirect(`${webOrigin}/auth/sign-in?error=google`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('totp/setup')
  setupTotp(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.setupTotp(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('totp/enable')
  enableTotp(@CurrentUser() user: AuthenticatedUser, @Body() dto: TotpCodeDto) {
    return this.authService.enableTotp(user.sub, dto.code);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('totp/disable')
  disableTotp(@CurrentUser() user: AuthenticatedUser, @Body() dto: TotpCodeDto) {
    return this.authService.disableTotp(user.sub, dto.code);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@CurrentUser() user: AuthenticatedUser, @Body() dto: RefreshTokenDto) {
    return this.authService.logout(user.sub, dto.refreshToken);
  }
}
