import { Module } from '@nestjs/common';
import { PresupuestosService } from './presupuestos.service.js';
import { PresupuestosController, PublicPresupuestosController } from './presupuestos.controller.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [MailModule],
  controllers: [PresupuestosController, PublicPresupuestosController],
  providers: [PresupuestosService],
})
export class PresupuestosModule {}
