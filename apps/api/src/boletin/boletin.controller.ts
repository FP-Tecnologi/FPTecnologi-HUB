import { BadRequestException, Body, Controller, Delete, Get, Headers, Ip, Param, Post, Query, UseGuards } from '@nestjs/common';
import { BoletinService } from './boletin.service.js';
import { SuscribirDto } from './boletin.dto.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';

/** Dashboard: suscriptores del boletín (admin y marketing de la marca). */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'marketing')
@Controller('boletin/suscriptores')
export class BoletinController {
  constructor(private readonly boletin: BoletinService) {}

  @Get()
  list(@MarcaActual() marcaId: string) {
    return this.boletin.list(marcaId);
  }

  @Delete(':id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.boletin.eliminar(marcaId, id);
  }
}

/** Web pública (sin login): formulario de suscripción del pie de página. */
@Public()
@Controller('public/boletin')
export class PublicBoletinController {
  constructor(private readonly boletin: BoletinService) {}

  @Post('suscribir')
  suscribir(
    @Query('marcaId') marcaId: string,
    @Body() dto: SuscribirDto,
    @Ip() ip: string,
    @Headers('x-forwarded-for') forwarded?: string,
  ) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    // La IP real del visitante viaja en x-forwarded-for desde el proxy de la web (tope suave anti-spam).
    return this.boletin.suscribir(marcaId, dto, forwarded?.split(',')[0]?.trim() || ip);
  }
}
