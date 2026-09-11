import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { CreateRolDto } from './dto/create-rol.dto.js';
import { AsignarRolDto } from './dto/asignar-rol.dto.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

@UseGuards(JwtAuthGuard)
@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('roles')
  createRol(@Body() dto: CreateRolDto) {
    return this.rolesService.createRol(dto);
  }

  @Get('roles')
  findAllRoles() {
    return this.rolesService.findAllRoles();
  }

  @UseGuards(MarcaRolGuard)
  @Roles('admin')
  @Post('roles/asignaciones')
  asignar(@Body() dto: AsignarRolDto) {
    return this.rolesService.asignar(dto);
  }

  // Alta de cuenta para un miembro nuevo del equipo — solo un admin de la
  // marca activa puede crear cuentas, no hay auto-registro público.
  @UseGuards(MarcaRolGuard)
  @Roles('admin')
  @Post('roles/equipo')
  crearUsuarioEnMarca(@MarcaActual() marcaId: string, @Body() dto: CrearUsuarioDto) {
    return this.rolesService.crearUsuarioEnMarca(marcaId, dto);
  }

  @UseGuards(MarcaRolGuard)
  @Roles('admin')
  @Delete('roles/asignaciones/:usuarioId/:marcaId/:rolId')
  quitarAsignacion(
    @Param('usuarioId') usuarioId: string,
    @Param('marcaId') marcaId: string,
    @Param('rolId') rolId: string,
  ) {
    return this.rolesService.quitarAsignacion(usuarioId, marcaId, rolId);
  }

  @UseGuards(MarcaRolGuard)
  @Get('marcas/:marcaId/equipo')
  equipoDeMarca(@Param('marcaId') marcaId: string) {
    return this.rolesService.equipoDeMarca(marcaId);
  }

  // El propio usuario autenticado consulta sus marcas/roles para armar el
  // selector de marca activa en el dashboard (no requiere x-marca-id).
  @Get('usuarios/me/marcas')
  misMarcas(@CurrentUser() user: AuthenticatedUser) {
    return this.rolesService.marcasDeUsuario(user.sub);
  }
}
