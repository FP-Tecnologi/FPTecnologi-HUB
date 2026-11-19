import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service.js';
import { ReportesAreasService } from './reportes-areas.service.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';

/** Dashboard → Reportes. */
@UseGuards(MarcaRolGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportes: ReportesService, private readonly areas: ReportesAreasService) {}

  /** `desde` y `hasta` en YYYY-MM-DD (días de Lima). `detalle=1` agrega la lista de pedidos para exportar. */
  @Roles('admin', 'ventas', 'finanzas', 'direccion')
  @Get('ventas')
  ventas(@MarcaActual() marcaId: string, @Query('desde') desde?: string, @Query('hasta') hasta?: string, @Query('detalle') detalle?: string) {
    return this.reportes.ventas(marcaId, desde, hasta, detalle === '1');
  }

  /** Reportes por área. Mismo contrato: `desde`/`hasta` YYYY-MM-DD → `{ rango, kpis, serie, tablas }`. */
  @Roles('admin', 'marketing', 'direccion')
  @Get('marketing')
  marketing(@MarcaActual() marcaId: string, @Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.areas.marketing(marcaId, desde, hasta);
  }

  @Roles('admin', 'comercial', 'jefe_comercial', 'direccion')
  @Get('comercial')
  comercial(@MarcaActual() marcaId: string, @Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.areas.comercial(marcaId, desde, hasta);
  }

  @Roles('admin', 'soporte', 'comercial', 'direccion')
  @Get('soporte')
  soporte(@MarcaActual() marcaId: string, @Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.areas.soporte(marcaId, desde, hasta);
  }

  @Roles('admin', 'finanzas', 'direccion')
  @Get('finanzas')
  finanzas(@MarcaActual() marcaId: string, @Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.areas.finanzas(marcaId, desde, hasta);
  }

  @Roles('admin', 'direccion')
  @Get('direccion')
  direccion(@MarcaActual() marcaId: string, @Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.areas.direccion(marcaId, desde, hasta);
  }
}
