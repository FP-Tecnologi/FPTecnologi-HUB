import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { RequestOtpDto } from './dto/request-otp.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { TotpCodeDto } from './dto/totp-code.dto.js';
import { VerifyTotpLoginDto } from './dto/verify-totp-login.dto.js';
import { Public } from '../common/decorators/public.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from './types/authenticated-user.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // No hay auto-registro público — las cuentas las crea un admin desde
  // POST /roles/equipo (ver RolesController). Evita altas sin dueño y sin
  // marca/rol asignado.

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('otp/request')
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto.email);
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('otp/verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.codigo);
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('totp/verify-login')
  verifyTotpLogin(@Body() dto: VerifyTotpLoginDto) {
    return this.authService.verifyTotpLogin(dto.email, dto.code);
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
