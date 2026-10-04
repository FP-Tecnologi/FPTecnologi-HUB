import { Module } from '@nestjs/common';
import { PresupuestosService } from './presupuestos.service.js';
import { PublicPresupuestosController } from './presupuestos.controller.js';

@Module({
  controllers: [PublicPresupuestosController],
  providers: [PresupuestosService],
})
export class PresupuestosModule {}
