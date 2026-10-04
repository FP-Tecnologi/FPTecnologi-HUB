import { BadRequestException, Body, Controller, Delete, Get, Headers, Ip, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Limite } from '../common/guards/limite-peticiones.guard.js';
import { Public } from '../common/decorators/public.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { PresupuestosService } from './presupuestos.service.js';
import { CrearPresupuestoDto } from './dto/crear-presupuesto.dto.js';
import { CambiarEstadoPresupuestoDto } from './dto/cambiar-estado-presupuesto.dto.js';

/** Presupuestos de productos para clientes mayoristas (web pública, sin login). */
@Public()
@Controller('public/presupuestos')
export class PublicPresupuestosController {
  constructor(private readonly presupuestos: PresupuestosService) {}

  @Limite(10)
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

/** Dashboard → Ecommerce → Presupuestos: solicitudes mayoristas, estado y reenvío al cliente. */
@UseGuards(JwtAuthGuard, MarcaRolGuard)
@Roles('admin', 'comercial', 'ventas')
@Controller('presupuestos')
export class PresupuestosController {
  constructor(private readonly presupuestos: PresupuestosService) {}

  @Get()
  findAll(@MarcaActual() marcaId: string) {
    return this.presupuestos.findAll(marcaId);
  }

  @Get(':id')
  findOne(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.presupuestos.findOne(marcaId, id);
  }

  @Patch(':id')
  cambiarEstado(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: CambiarEstadoPresupuestoDto) {
    return this.presupuestos.cambiarEstado(marcaId, id, dto.estado);
  }

  @Post(':id/enviar')
  reenviar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.presupuestos.reenviar(marcaId, id);
  }

  @Roles('admin')
  @Delete(':id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.presupuestos.eliminar(marcaId, id);
  }
}
