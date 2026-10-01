import { Module } from '@nestjs/common';
import { ConocimientoService } from './conocimiento.service.js';
import { ConocimientoController, PublicConocimientoController } from './conocimiento.controller.js';

@Module({ controllers: [ConocimientoController, PublicConocimientoController], providers: [ConocimientoService] })
export class ConocimientoModule {}
