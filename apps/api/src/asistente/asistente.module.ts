import { Module } from '@nestjs/common';
import { AsistenteController } from './asistente.controller.js';
import { AsistenteService } from './asistente.service.js';
import { ReportesService } from '../reportes/reportes.service.js';
import { ConocimientoService } from '../conocimiento/conocimiento.service.js';
import { SuperAdminGuard } from '../common/guards/super-admin.guard.js';

@Module({ controllers: [AsistenteController], providers: [AsistenteService, ReportesService, ConocimientoService, SuperAdminGuard] })
export class AsistenteModule {}
