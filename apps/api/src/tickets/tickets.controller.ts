import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { ActualizarTicketDto, CrearTicketDto } from './tickets.dto.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Limite } from '../common/guards/limite-peticiones.guard.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

/** Web pública (/tickets): reclamo, verificación o soporte sobre una compra. */
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
}

/** Dashboard → Soporte → Tickets (admin y comercial de la marca). */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'comercial')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get()
  list(@MarcaActual() marcaId: string) {
    return this.tickets.list(marcaId);
  }

  @Get(':id')
  get(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.tickets.get(marcaId, id);
  }

  @Patch(':id')
  actualizar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActualizarTicketDto, @CurrentUser() user: AuthenticatedUser) {
    return this.tickets.actualizar(marcaId, id, dto, user.email);
  }

  @Roles('admin')
  @Delete(':id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.tickets.eliminar(marcaId, id);
  }
}
