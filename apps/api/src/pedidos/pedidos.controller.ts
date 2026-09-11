import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PedidosService } from './pedidos.service.js';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';

@UseGuards(JwtAuthGuard, MarcaRolGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  create(@MarcaActual() marcaId: string, @Body() dto: CreatePedidoDto) {
    return this.pedidosService.create(marcaId, dto);
  }

  @Get()
  findAll(@MarcaActual() marcaId: string) {
    return this.pedidosService.findAll(marcaId);
  }

  @Get(':id')
  findOne(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.pedidosService.findOne(marcaId, id);
  }

  @Roles('admin', 'ventas')
  @Patch(':id/estado')
  updateEstado(
    @MarcaActual() marcaId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEstadoPedidoDto,
  ) {
    return this.pedidosService.updateEstado(marcaId, id, dto);
  }
}
