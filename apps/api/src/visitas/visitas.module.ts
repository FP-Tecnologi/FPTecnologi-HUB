import { Module } from '@nestjs/common';
import { VisitasService } from './visitas.service.js';
import { PublicVisitasController, VisitasController } from './visitas.controller.js';

@Module({ controllers: [VisitasController, PublicVisitasController], providers: [VisitasService], exports: [VisitasService] })
export class VisitasModule {}
