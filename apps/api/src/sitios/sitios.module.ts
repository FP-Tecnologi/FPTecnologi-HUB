import { Module } from '@nestjs/common';
import { SitiosService } from './sitios.service.js';
import { SitiosController } from './sitios.controller.js';

@Module({
  controllers: [SitiosController],
  providers: [SitiosService],
})
export class SitiosModule {}
