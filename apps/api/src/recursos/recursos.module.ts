import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module.js';
import { TicketsModule } from '../tickets/tickets.module.js';
import { RecursosService } from './recursos.service.js';
import { PublicSociosController, RecursosController } from './recursos.controller.js';
import { CuentaModule } from '../cuenta/cuenta.module.js';
import { UploadsModule } from '../uploads/uploads.module.js';

@Module({
  imports: [CuentaModule, UploadsModule, MailModule, TicketsModule],
  controllers: [RecursosController, PublicSociosController],
  providers: [RecursosService],
})
export class RecursosModule {}
