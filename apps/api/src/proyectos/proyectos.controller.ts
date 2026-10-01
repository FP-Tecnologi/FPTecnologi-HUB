import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ProyectosService } from './proyectos.service.js';
import { CreateProyectoDto, UpdateProyectoDto } from './proyectos.dto.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';

/** Dashboard: proyectos de referencia de la web (admin y marketing de la marca). */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'marketing')
@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly proyectos: ProyectosService) {}

  @Get()
  list(@MarcaActual() marcaId: string) {
    return this.proyectos.list(marcaId);
  }

  @Post()
  create(@MarcaActual() marcaId: string, @Body() dto: CreateProyectoDto) {
    return this.proyectos.create(marcaId, dto);
  }

  @Patch(':id')
  update(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: UpdateProyectoDto) {
    return this.proyectos.update(marcaId, id, dto);
  }

  @Delete(':id')
  remove(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.proyectos.remove(marcaId, id);
  }
}
