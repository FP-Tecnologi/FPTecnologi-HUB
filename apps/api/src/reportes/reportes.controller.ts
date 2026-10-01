import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';

/** Dashboard → Reportes. */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'ventas')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportes: ReportesService) {}

  /** `desde` y `hasta` en YYYY-MM-DD (días de Lima). `detalle=1` agrega la lista de pedidos para exportar. */
  @Get('ventas')
  ventas(@MarcaActual() marcaId: string, @Query('desde') desde?: string, @Query('hasta') hasta?: string, @Query('detalle') detalle?: string) {
    return this.reportes.ventas(marcaId, desde, hasta, detalle === '1');
  }
}
