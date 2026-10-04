import { BadRequestException, Body, Controller, Get, Headers, Ip, Param, Post, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator.js';
import { PresupuestosService } from './presupuestos.service.js';
import { CrearPresupuestoDto } from './dto/crear-presupuesto.dto.js';

/** Presupuestos de productos para clientes mayoristas (web pública, sin login). */
@Public()
@Controller('public/presupuestos')
export class PublicPresupuestosController {
  constructor(private readonly presupuestos: PresupuestosService) {}

  @Post()
  crear(@Query('marcaId') marcaId: string, @Body() dto: CrearPresupuestoDto, @Ip() ip: string, @Headers('x-forwarded-for') forwarded?: string) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    // La IP real del visitante viaja en x-forwarded-for desde el proxy de la web (tope suave anti-spam).
    return this.presupuestos.crear(marcaId, dto, forwarded?.split(',')[0]?.trim() || ip);
  }

  @Get(':id')
  ver(@Query('marcaId') marcaId: string, @Param('id') id: string) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.presupuestos.verPublico(marcaId, id);
  }
}
