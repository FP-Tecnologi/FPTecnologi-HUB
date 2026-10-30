import { Module } from '@nestjs/common';
import { BbvaService } from './bbva.service.js';
import { PublicBbvaController } from './bbva.controller.js';
import { ContactoWebModule } from '../contacto-web/contacto-web.module.js';

@Module({
  imports: [ContactoWebModule],
  controllers: [PublicBbvaController],
  providers: [BbvaService],
})
export class BbvaModule {}
