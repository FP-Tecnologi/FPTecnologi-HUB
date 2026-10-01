import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { CreateRolDto } from './dto/create-rol.dto.js';
import { AsignarRolDto } from './dto/asignar-rol.dto.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { ActualizarMiembroDto } from './dto/actualizar-miembro.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

/** MarcaRolGuard solo valida la marca del header: un marcaId distinto en la URL/body sería otra marca. */
function mismaMarca(marcaActual: string, marcaPedida: string) {
  if (marcaActual !== marcaPedida) {
    throw new ForbiddenException('La marca no coincide con la marca activa');
  }
}

@UseGuards(JwtAuthGuard)
@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(MarcaRolGuard)
  @Roles('admin')
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
  asignar(@MarcaActual() marcaId: string, @Body() dto: AsignarRolDto) {
    mismaMarca(marcaId, dto.marcaId);
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

  // Cambiar rol y/o activar-desactivar a un miembro de la marca activa.
  @UseGuards(MarcaRolGuard)
  @Roles('admin')
  @Patch('roles/equipo/:usuarioId')
  actualizarMiembro(
    @MarcaActual() marcaId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('usuarioId') usuarioId: string,
    @Body() dto: ActualizarMiembroDto,
  ) {
    return this.rolesService.actualizarMiembro(marcaId, user.sub, usuarioId, dto);
  }

  // Quita al usuario de la marca activa (todos sus roles aquí); la cuenta sigue existiendo.
  @UseGuards(MarcaRolGuard)
  @Roles('admin')
  @Delete('roles/equipo/:usuarioId')
  quitarMiembro(
    @MarcaActual() marcaId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('usuarioId') usuarioId: string,
  ) {
    return this.rolesService.quitarMiembro(marcaId, user.sub, usuarioId);
  }

  @UseGuards(MarcaRolGuard)
  @Roles('admin')
  @Delete('roles/asignaciones/:usuarioId/:marcaId/:rolId')
  quitarAsignacion(
    @MarcaActual() marcaActual: string,
    @Param('usuarioId') usuarioId: string,
    @Param('marcaId') marcaId: string,
    @Param('rolId') rolId: string,
  ) {
    mismaMarca(marcaActual, marcaId);
    return this.rolesService.quitarAsignacion(usuarioId, marcaId, rolId);
  }

  @UseGuards(MarcaRolGuard)
  @Get('marcas/:marcaId/equipo')
  equipoDeMarca(@MarcaActual() marcaActual: string, @Param('marcaId') marcaId: string) {
    mismaMarca(marcaActual, marcaId);
    return this.rolesService.equipoDeMarca(marcaId);
  }

  // Clientes (rol "cliente") registrados desde las webs públicas de la marca.
  @UseGuards(MarcaRolGuard)
  @Roles('admin')
  @Get('roles/clientes')
  clientesDeMarca(@MarcaActual() marcaId: string) {
    return this.rolesService.clientesDeMarca(marcaId);
  }

  // El propio usuario autenticado consulta sus marcas/roles para armar el
  // selector de marca activa en el dashboard (no requiere x-marca-id).
  @Get('usuarios/me/marcas')
  misMarcas(@CurrentUser() user: AuthenticatedUser) {
    return this.rolesService.marcasDeUsuario(user.sub);
  }
}
