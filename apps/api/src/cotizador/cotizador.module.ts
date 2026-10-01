import { Module } from '@nestjs/common';
import { CotizadorService } from './cotizador.service.js';
import { CotizadorController, PublicCotizadorController } from './cotizador.controller.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [MailModule],
  controllers: [CotizadorController, PublicCotizadorController],
  providers: [CotizadorService],
})
export class CotizadorModule {}
