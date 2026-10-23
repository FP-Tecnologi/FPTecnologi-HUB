import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { SuperAdminGuard } from '../common/guards/super-admin.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { AsistenteService } from './asistente.service.js';

class MensajeDto {
  @IsIn(['user', 'assistant']) role!: 'user' | 'assistant';
  @IsString() @MinLength(1) @MaxLength(2000) content!: string;
}

class ConsultarDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(12) @ValidateNested({ each: true }) @Type(() => MensajeDto)
  mensajes!: MensajeDto[];
}

/**
 * Dashboard → Administración → Asistente virtual. Solo el super administrador (la vista global del dashboard), sobre
 * una marca a la que tenga acceso (x-marca-id); las herramientas se recortan según su rol en esa marca.
 */
@UseGuards(SuperAdminGuard, MarcaRolGuard)
@Controller('asistente')
export class AsistenteController {
  constructor(private readonly asistente: AsistenteService) {}

  @Post('consultar')
  consultar(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: ConsultarDto) {
    return this.asistente.consultar(marcaId, user, dto.mensajes);
  }
}
