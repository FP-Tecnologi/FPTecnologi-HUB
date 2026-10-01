import { Module } from '@nestjs/common';
import { CotizacionesService } from './cotizaciones.service.js';
import { CotizacionesController, PublicCotizacionesController } from './cotizaciones.controller.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [MailModule],
  controllers: [CotizacionesController, PublicCotizacionesController],
  providers: [CotizacionesService],
})
export class CotizacionesModule {}
