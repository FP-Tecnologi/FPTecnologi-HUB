import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MailingService, type EnviarAprobacion } from './mailing.service.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

/** Mailing: el equipo manda un correo a aprobación; el admin lo aprueba o lo rechaza. */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'marketing', 'ventas', 'comercial')
@Controller('mailing/aprobaciones')
export class MailingController {
  constructor(private readonly mailing: MailingService) {}

  private esAdmin(u: AuthenticatedUser, marcaId: string) {
    return u.marcas.some((m) => m.marcaId === marcaId && m.rol.toLowerCase() === 'admin');
  }

  @Post()
  enviar(@MarcaActual() marcaId: string, @Body() dto: EnviarAprobacion, @CurrentUser() u: AuthenticatedUser) {
    return this.mailing.enviar(marcaId, u.email, dto);
  }

  @Get()
  list(@MarcaActual() marcaId: string, @CurrentUser() u: AuthenticatedUser) {
    return this.mailing.list(marcaId, u.email, this.esAdmin(u, marcaId));
  }

  @Get(':id')
  detalle(@MarcaActual() marcaId: string, @Param('id') id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.mailing.detalle(marcaId, id, u.email, this.esAdmin(u, marcaId));
  }

  @Roles('admin')
  @Patch(':id/aprobar')
  aprobar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() b: { nota?: string }, @CurrentUser() u: AuthenticatedUser) {
    return this.mailing.revisar(marcaId, id, u.email, 'APROBADO', b?.nota);
  }

  @Roles('admin')
  @Patch(':id/rechazar')
  rechazar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() b: { nota?: string }, @CurrentUser() u: AuthenticatedUser) {
    return this.mailing.revisar(marcaId, id, u.email, 'RECHAZADO', b?.nota);
  }
}
