import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EnviosService } from './envios.service.js';
import { ActualizarTarifaDto, CrearTarifaDto } from './envios.dto.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';

/** Dashboard → Ecommerce → Envíos: tarifario por departamento. */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'ventas')
@Controller('envios/tarifas')
export class EnviosController {
  constructor(private readonly envios: EnviosService) {}

  @Get()
  tarifas(@MarcaActual() marcaId: string) {
    return this.envios.tarifas(marcaId);
  }

  @Post()
  crear(@MarcaActual() marcaId: string, @Body() dto: CrearTarifaDto) {
    return this.envios.crear(marcaId, dto);
  }

  @Patch(':id')
  actualizar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActualizarTarifaDto) {
    return this.envios.actualizar(marcaId, id, dto);
  }

  @Delete(':id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.envios.eliminar(marcaId, id);
  }
}

/** Checkout público: departamentos con envío, costo, plazo y agencias. */
@Public()
@Controller('public/envios')
export class PublicEnviosController {
  constructor(private readonly envios: EnviosService) {}

  @Get('tarifas')
  tarifas(@Query('marcaId') marcaId: string) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.envios.tarifasPublicas(marcaId);
  }
}
