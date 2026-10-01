import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service.js';
import { PedidosController, PublicPedidosController } from './pedidos.controller.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [MailModule],
  controllers: [PedidosController, PublicPedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
