import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ClientesTiendaService } from './clientes-tienda.service.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';

/** Dashboard → Ecommerce → Clientes. */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'ventas')
@Controller('clientes-tienda')
export class ClientesTiendaController {
  constructor(private readonly clientes: ClientesTiendaService) {}

  @Get()
  listar(@MarcaActual() marcaId: string) {
    return this.clientes.listar(marcaId);
  }

  @Get('detalle')
  detalle(@MarcaActual() marcaId: string, @Query('email') email: string) {
    return this.clientes.detalle(marcaId, email);
  }
}
