import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsBoolean, IsString } from 'class-validator';
import { UsuariosGlobalService } from './usuarios-global.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { SuperAdminGuard } from '../common/guards/super-admin.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

class ActivoDto { @IsBoolean() activo!: boolean }
class AsignacionDto { @IsString() marcaId!: string; @IsString() rolId!: string }

/** Administración global: todos los usuarios de todas las marcas. Solo super admin (admin de todas las marcas). */
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('usuarios/global')
export class UsuariosGlobalController {
  constructor(private readonly global: UsuariosGlobalService) {}

  @Get()
  listar(@Query('q') q?: string, @Query('marcaId') marcaId?: string, @Query('rolId') rolId?: string) {
    return this.global.listar({ q, marcaId, rolId });
  }

  @Patch(':id/activo')
  activo(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: ActivoDto) {
    if (id === user.sub) throw new BadRequestException('No puedes desactivar tu propia cuenta');
    return this.global.activar(id, dto.activo);
  }

  @Post(':id/asignaciones')
  asignar(@Param('id') id: string, @Body() dto: AsignacionDto) {
    return this.global.asignar(id, dto.marcaId, dto.rolId);
  }

  @Delete(':id/asignaciones/:marcaId/:rolId')
  quitar(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Param('marcaId') marcaId: string, @Param('rolId') rolId: string) {
    return this.global.quitar(user.sub, id, marcaId, rolId);
  }
}
