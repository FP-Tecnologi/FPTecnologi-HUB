import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SoporteService } from './soporte.service.js';
import { ActividadService } from '../actividad/actividad.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { SuperAdminGuard } from '../common/guards/super-admin.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

class CrearSoporteDto {
  @IsString() @MinLength(3) @MaxLength(120) asunto!: string;
  @IsString() @MaxLength(60) categoria!: string;
  @IsString() @MinLength(5) @MaxLength(4000) mensaje!: string;
}

class AtenderSoporteDto {
  @IsOptional() @IsIn(['ABIERTO', 'EN_REVISION', 'CERRADO']) estado?: string;
  @IsOptional() @IsString() @MaxLength(4000) respuesta?: string;
}

/** Tickets de soporte de la plataforma. Cualquier usuario con sesión abre y ve los suyos; solo el super admin atiende. */
@UseGuards(JwtAuthGuard)
@Controller('soporte')
export class SoporteController {
  constructor(private readonly soporte: SoporteService, private readonly actividad: ActividadService) {}

  @Post()
  crear(@CurrentUser() user: AuthenticatedUser, @Body() dto: CrearSoporteDto, @Query('marcaId') marcaId?: string) {
    return this.soporte.crear(user.sub, marcaId, dto);
  }

  @Get('mios')
  mios(@CurrentUser() user: AuthenticatedUser) {
    return this.soporte.mios(user.sub);
  }

  @UseGuards(SuperAdminGuard)
  @Get()
  listar(@Query('estado') estado?: string, @Query('marcaId') marcaId?: string, @Query('q') q?: string) {
    return this.soporte.listar({ estado, marcaId, q });
  }

  @UseGuards(SuperAdminGuard)
  @Patch(':id')
  atender(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: AtenderSoporteDto) {
    return this.soporte.atender(id, user.email, dto).then((r) => {
      void this.actividad.registrar({ usuarioId: user.sub, email: user.email, accion: 'ticket_atendido', detalle: `Ticket ${id}${dto.estado ? ` · ${dto.estado}` : ''}${dto.respuesta ? ' · con respuesta' : ''}` });
      return r;
    });
  }
}
