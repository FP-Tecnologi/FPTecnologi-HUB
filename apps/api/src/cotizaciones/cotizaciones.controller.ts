import { Body, Controller, Delete, Get, Headers, Ip, Param, Patch, Post, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { CotizacionesService } from './cotizaciones.service.js';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto.js';
import { ActualizarCotizacionDto, EnviarCotizacionDto } from './dto/gestion-cotizacion.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

/** Dashboard → Soluciones → Cotizaciones: solicitudes por servicio, propuesta y envío al cliente. */
@UseGuards(JwtAuthGuard, MarcaRolGuard)
@Roles('admin', 'comercial', 'ventas')
@Controller('cotizaciones')
export class CotizacionesController {
  constructor(private readonly cotizaciones: CotizacionesService) {}

  @Get()
  findAll(@MarcaActual() marcaId: string) {
    return this.cotizaciones.findAll(marcaId);
  }

  @Get(':id')
  findOne(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.cotizaciones.findOne(marcaId, id);
  }

  @Patch(':id')
  actualizar(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: ActualizarCotizacionDto) {
    return this.cotizaciones.actualizar(marcaId, id, dto, user.email);
  }

  @Post(':id/enviar')
  enviar(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: EnviarCotizacionDto) {
    return this.cotizaciones.enviar(marcaId, id, dto, user.email);
  }

  @Roles('admin')
  @Delete(':id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.cotizaciones.eliminar(marcaId, id);
  }
}

/** Formulario público del detalle de cada servicio (sin login). */
@Public()
@Controller('public/cotizaciones')
export class PublicCotizacionesController {
  constructor(private readonly cotizaciones: CotizacionesService) {}

  @Post()
  crear(
    @Query('marcaId') marcaId: string,
    @Body() dto: CreateCotizacionDto,
    @Ip() ip: string,
    @Headers('x-forwarded-for') forwarded?: string,
  ) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    // La IP real del visitante viaja en x-forwarded-for desde el proxy de la web (tope suave anti-spam).
    return this.cotizaciones.create(marcaId, dto, forwarded?.split(',')[0]?.trim() || ip);
  }
}
