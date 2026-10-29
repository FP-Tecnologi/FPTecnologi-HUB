import { Module } from '@nestjs/common';
import { BbvaService } from './bbva.service.js';
import { PublicBbvaController } from './bbva.controller.js';

@Module({
  controllers: [PublicBbvaController],
  providers: [BbvaService],
})
export class BbvaModule {}
