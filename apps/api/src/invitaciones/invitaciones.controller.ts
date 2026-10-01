import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InvitacionesService } from './invitaciones.service.js';
import { AceptarInvitacionDto, CrearInvitacionDto } from './invitaciones.dto.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';

/** Dashboard: invitaciones pendientes de la marca activa (solo admin). */
@UseGuards(MarcaRolGuard)
@Roles('admin')
@Controller('invitaciones')
export class InvitacionesController {
  constructor(private readonly invitaciones: InvitacionesService) {}

  @Get()
  pendientes(@MarcaActual() marcaId: string) {
    return this.invitaciones.pendientes(marcaId);
  }

  @Post()
  crear(@MarcaActual() marcaId: string, @Body() dto: CrearInvitacionDto) {
    return this.invitaciones.crear(marcaId, dto);
  }

  @Post(':id/reenviar')
  reenviar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.invitaciones.reenviar(marcaId, id);
  }

  @Delete(':id')
  revocar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.invitaciones.revocar(marcaId, id);
  }
}

/** Página de aceptación (sin login): el invitado llega con el token del correo. */
@Public()
@Controller('public/invitaciones')
export class PublicInvitacionesController {
  constructor(private readonly invitaciones: InvitacionesService) {}

  @Post('aceptar')
  aceptar(@Body() dto: AceptarInvitacionDto) {
    return this.invitaciones.aceptar(dto);
  }

  @Get(':token')
  info(@Param('token') token: string) {
    return this.invitaciones.info(token);
  }
}
