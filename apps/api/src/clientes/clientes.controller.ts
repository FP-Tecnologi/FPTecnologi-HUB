import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service.js';
import { CreateClienteDto, UpdateClienteDto } from './clientes.dto.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';

/** Dashboard: clientes de referencia de la web (admin y marketing de la marca). */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'marketing')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientes: ClientesService) {}

  @Get()
  list(@MarcaActual() marcaId: string) {
    return this.clientes.list(marcaId);
  }

  @Post()
  create(@MarcaActual() marcaId: string, @Body() dto: CreateClienteDto) {
    return this.clientes.create(marcaId, dto);
  }

  @Patch(':id')
  update(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: UpdateClienteDto) {
    return this.clientes.update(marcaId, id, dto);
  }

  @Delete(':id')
  remove(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.clientes.remove(marcaId, id);
  }
}
