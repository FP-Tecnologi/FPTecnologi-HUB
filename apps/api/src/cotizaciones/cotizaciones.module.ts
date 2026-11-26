import { Module } from '@nestjs/common';
import { CotizacionesService } from './cotizaciones.service.js';
import { CotizacionesController, PublicCotizacionesController } from './cotizaciones.controller.js';
import { MailModule } from '../mail/mail.module.js';
import { CrmModule } from '../crm/crm.module.js';

@Module({
  imports: [MailModule, CrmModule],
  controllers: [CotizacionesController, PublicCotizacionesController],
  providers: [CotizacionesService],
  exports: [CotizacionesService],
})
export class CotizacionesModule {}
