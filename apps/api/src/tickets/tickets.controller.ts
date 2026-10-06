import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Res, UseGuards, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { TicketsService } from './tickets.service.js';
import { ActualizarTicketDto, CrearTicketDto, MensajeEquipoDto, ResponderTicketDto, SeguimientoTicketDto } from './tickets.dto.js';
import { UploadsService } from '../uploads/uploads.service.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Limite } from '../common/guards/limite-peticiones.guard.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

/** Web pública (/tickets): abrir un ticket, ver su seguimiento y responder. */
@Public()
@Controller('public/tickets')
export class PublicTicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Limite(5)
  @Post()
  crear(@Query('marcaId') marcaId: string, @Body() dto: CrearTicketDto) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.tickets.crearPublico(marcaId, dto);
  }

  // Límite bajo: número + correo funcionan como contraseña, no debe poder adivinarse a fuerza bruta.
  @Limite(10)
  @Post('seguimiento')
  seguimiento(@Query('marcaId') marcaId: string, @Body() dto: SeguimientoTicketDto) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.tickets.seguimiento(marcaId, dto.numero, dto.email);
  }

  @Limite(10)
  @Post('responder')
  responder(@Query('marcaId') marcaId: string, @Body() dto: ResponderTicketDto) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.tickets.responderPublico(marcaId, dto);
  }
}

/** Dashboard → Web → Tickets (admin y comercial de la marca). */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'comercial')
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly tickets: TicketsService,
    private readonly uploads: UploadsService,
  ) {}

  @Get()
  list(@MarcaActual() marcaId: string) {
    return this.tickets.list(marcaId);
  }

  /** Evidencia adjunta (privada): solo con sesión del equipo y si pertenece a un ticket de la marca. */
  @Get('archivo')
  async archivo(@MarcaActual() marcaId: string, @Query('clave') clave: string, @Res() res: Response) {
    if (!clave || !(await this.tickets.clavePerteneceAMarca(marcaId, clave))) throw new NotFoundException('Archivo no encontrado');
    this.uploads.enviar(res, clave, { inline: true });
  }

  @Get(':id')
  get(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.tickets.get(marcaId, id);
  }

  @Patch(':id')
  actualizar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActualizarTicketDto, @CurrentUser() user: AuthenticatedUser) {
    return this.tickets.actualizar(marcaId, id, dto, user.email);
  }

  @Post(':id/mensajes')
  responder(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: MensajeEquipoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.tickets.responder(marcaId, id, dto, user.email);
  }

  @Roles('admin')
  @Delete(':id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.tickets.eliminar(marcaId, id);
  }
}
