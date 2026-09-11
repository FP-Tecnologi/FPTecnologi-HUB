import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { UpdatePerfilDto } from './dto/update-perfil.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

/**
 * Perfil del propio usuario autenticado. No lleva MarcaRolGuard: cada uno
 * edita lo suyo sin importar la marca activa.
 */
@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Patch('me')
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdatePerfilDto) {
    return this.usuariosService.updatePerfil(user.sub, dto);
  }
}
