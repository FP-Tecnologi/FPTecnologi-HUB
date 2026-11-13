import { Global, Module } from '@nestjs/common';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActividadService, type FiltroActividad } from './actividad.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { SuperAdminGuard } from '../common/guards/super-admin.guard.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';

/** Registro de actividad de toda la plataforma. Solo el super admin lo consulta. */
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('actividad')
export class ActividadController {
  constructor(private readonly actividad: ActividadService) {}

  @Get()
  listar(@Query() f: FiltroActividad) {
    return this.actividad.listar(f);
  }

  @Get('exportar')
  exportar(@Query() f: FiltroActividad) {
    return this.actividad.exportar(f);
  }
}

/** Actividad de la marca activa, para su administrador (no ve la de otras marcas). */
@UseGuards(MarcaRolGuard)
@Roles('admin')
@Controller('actividad-marca')
export class ActividadMarcaController {
  constructor(private readonly actividad: ActividadService) {}

  @Get()
  listar(@MarcaActual() marcaId: string, @Query() f: FiltroActividad) {
    return this.actividad.listar(f, marcaId);
  }

  @Get('exportar')
  exportar(@MarcaActual() marcaId: string, @Query() f: FiltroActividad) {
    return this.actividad.exportar(f, marcaId);
  }
}

@Global()
@Module({
  controllers: [ActividadController, ActividadMarcaController],
  providers: [ActividadService, SuperAdminGuard],
  exports: [ActividadService],
})
export class ActividadModule {}
