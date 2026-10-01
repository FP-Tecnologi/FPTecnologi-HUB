import { Module } from '@nestjs/common';
import { ClientesTiendaService } from './clientes-tienda.service.js';
import { ClientesTiendaController } from './clientes-tienda.controller.js';

@Module({
  controllers: [ClientesTiendaController],
  providers: [ClientesTiendaService],
})
export class ClientesTiendaModule {}
