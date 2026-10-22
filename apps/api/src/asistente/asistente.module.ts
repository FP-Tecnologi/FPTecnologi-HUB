import { Module } from '@nestjs/common';
import { AsistenteController } from './asistente.controller.js';
import { AsistenteService } from './asistente.service.js';
import { ReportesService } from '../reportes/reportes.service.js';
import { ConocimientoService } from '../conocimiento/conocimiento.service.js';

@Module({ controllers: [AsistenteController], providers: [AsistenteService, ReportesService, ConocimientoService] })
export class AsistenteModule {}
