import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CampanasService } from './campanas.service.js';
import { ActualizarCampanaDto, CrearCampanaDto } from './campanas.dto.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';

/** Dashboard → Campañas → Campañas. */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'marketing', 'comercial')
@Controller('campanas')
export class CampanasController {
  constructor(private readonly campanas: CampanasService) {}

  @Get()
  list(@MarcaActual() marcaId: string) {
    return this.campanas.list(marcaId);
  }

  @Roles('admin', 'marketing')
  @Post()
  crear(@MarcaActual() marcaId: string, @Body() dto: CrearCampanaDto) {
    return this.campanas.crear(marcaId, dto);
  }

  @Roles('admin', 'marketing')
  @Patch(':id')
  actualizar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActualizarCampanaDto) {
    return this.campanas.actualizar(marcaId, id, dto);
  }

  @Roles('admin', 'marketing')
  @Delete(':id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.campanas.eliminar(marcaId, id);
  }
}
