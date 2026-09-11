import { Module } from '@nestjs/common';
import { ServiciosService } from './servicios.service.js';
import { ServiciosController } from './servicios.controller.js';

@Module({
  controllers: [ServiciosController],
  providers: [ServiciosService],
  exports: [ServiciosService],
})
export class ServiciosModule {}
