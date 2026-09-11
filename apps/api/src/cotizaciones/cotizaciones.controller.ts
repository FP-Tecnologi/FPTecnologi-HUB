import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CotizacionesService } from './cotizaciones.service.js';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto.js';
import { UpdateEstadoCotizacionDto } from './dto/update-estado-cotizacion.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Public } from '../common/decorators/public.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';

@Controller('cotizaciones')
export class CotizacionesController {
  constructor(private readonly cotizacionesService: CotizacionesService) {}

  // Solicitar una cotización es una acción pública (formulario en la web),
  // no requiere sesión — solo el marcaId (?marcaId=...) para saber a qué
  // marca corresponde el servicio solicitado.
  @Public()
  @Post()
  create(@MarcaActual() marcaId: string, @Body() dto: CreateCotizacionDto) {
    return this.cotizacionesService.create(marcaId, dto);
  }

  @UseGuards(JwtAuthGuard, MarcaRolGuard)
  @Get()
  findAll(@MarcaActual() marcaId: string) {
    return this.cotizacionesService.findAll(marcaId);
  }

  @UseGuards(JwtAuthGuard, MarcaRolGuard)
  @Get(':id')
  findOne(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.cotizacionesService.findOne(marcaId, id);
  }

  @UseGuards(JwtAuthGuard, MarcaRolGuard)
  @Patch(':id/estado')
  updateEstado(
    @MarcaActual() marcaId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEstadoCotizacionDto,
  ) {
    return this.cotizacionesService.updateEstado(marcaId, id, dto);
  }
}
