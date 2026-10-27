import { Module } from '@nestjs/common';
import { CotizadorService } from './cotizador.service.js';
import { CotizadorController, PublicCotizadorController } from './cotizador.controller.js';
import { MailModule } from '../mail/mail.module.js';
import { CrmModule } from '../crm/crm.module.js';

@Module({
  imports: [MailModule, CrmModule],
  controllers: [CotizadorController, PublicCotizadorController],
  providers: [CotizadorService],
})
export class CotizadorModule {}
