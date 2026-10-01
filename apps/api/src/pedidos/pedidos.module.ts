import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service.js';
import { PedidosController, PublicPedidosController } from './pedidos.controller.js';
import { MailModule } from '../mail/mail.module.js';
import { EnviosModule } from '../envios/envios.module.js';

@Module({
  imports: [MailModule, EnviosModule],
  controllers: [PedidosController, PublicPedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
