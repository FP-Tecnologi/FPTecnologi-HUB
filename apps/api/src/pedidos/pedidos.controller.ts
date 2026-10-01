import { Body, Controller, Get, Ip, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PedidosService } from './pedidos.service.js';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto.js';
import { CrearPedidoPublicoDto } from './dto/crear-pedido-publico.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';

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

/**
 * Checkout invitado de la tienda (sin login, sin pasarela en fase 1).
 * Mismo patrón que cotizador/boletín/chat: marcaId por query, honeypot y
 * tope por IP. Los totales se calculan en el servidor.
 */
@Public()
@Controller('public/pedidos')
export class PublicPedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  crear(@Query('marcaId') marcaId: string, @Body() dto: CrearPedidoPublicoDto, @Ip() ip: string) {
    return this.pedidosService.crearPublico(marcaId, dto, ip ?? 'desconocida');
  }
}
