import { Global, Module } from '@nestjs/common';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActividadService } from './actividad.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { SuperAdminGuard } from '../common/guards/super-admin.guard.js';

/** Registro de actividad de la plataforma. Solo el super admin lo consulta. */
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('actividad')
export class ActividadController {
  constructor(private readonly actividad: ActividadService) {}

  @Get()
  listar(@Query('q') q?: string, @Query('accion') accion?: string) {
    return this.actividad.listar({ q, accion });
  }
}

@Global()
@Module({
  controllers: [ActividadController],
  providers: [ActividadService, SuperAdminGuard],
  exports: [ActividadService],
})
export class ActividadModule {}
