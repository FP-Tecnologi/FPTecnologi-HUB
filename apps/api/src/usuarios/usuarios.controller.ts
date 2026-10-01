import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { UpdatePerfilDto } from './dto/update-perfil.dto.js';
import { Reset2faDto } from './dto/reset-2fa.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

/**
 * Perfil del propio usuario autenticado. No lleva MarcaRolGuard: cada uno
 * edita lo suyo sin importar la marca activa.
 */
@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('me/seguridad')
  seguridad(@CurrentUser() user: AuthenticatedUser) {
    return this.usuariosService.seguridad(user.sub);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdatePerfilDto) {
    return this.usuariosService.updatePerfil(user.sub, dto);
  }

  // Desbloqueo de 2FA por admin: el usuario bloqueado (perdió su app/códigos)
  // vuelve a entrar con contraseña + OTP al correo. Requiere ser admin de la
  // marca indicada en `x-marca-id` y que el objetivo pertenezca a ella.
  @UseGuards(MarcaRolGuard)
  @Roles('admin')
  @Post('2fa/reset')
  reset2fa(@MarcaActual() marcaId: string, @Body() dto: Reset2faDto) {
    return this.usuariosService.reset2fa(marcaId, dto.email);
  }
}
