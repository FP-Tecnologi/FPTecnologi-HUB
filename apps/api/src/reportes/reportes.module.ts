import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service.js';
import { ReportesAreasService } from './reportes-areas.service.js';
import { ReportesController } from './reportes.controller.js';

@Module({ controllers: [ReportesController], providers: [ReportesService, ReportesAreasService] })
export class ReportesModule {}
