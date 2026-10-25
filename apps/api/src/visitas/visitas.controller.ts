import { Body, Controller, Get, HttpCode, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { Limite } from '../common/guards/limite-peticiones.guard.js';
import { VisitasService } from './visitas.service.js';

class VisitaDto {
  @IsString() @MaxLength(500) ruta!: string;
  @IsOptional() @IsString() @MaxLength(1000) referrer?: string;
  @IsOptional() @IsString() @MaxLength(200) host?: string;
  @IsOptional() @IsString() @MaxLength(100) utm?: string;
}

const DIAS = [7, 30, 90];

/** Dashboard → tarjetas «Tráfico web» (dashboard de cada marca y vista de Administración). */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'marketing', 'comercial', 'ventas')
@Controller('visitas')
export class VisitasController {
  constructor(private readonly visitas: VisitasService) {}

  @Get('resumen')
  resumen(@MarcaActual() marcaId: string, @Query('dias') dias?: string) {
    const n = Number(dias);
    return this.visitas.resumen(marcaId, DIAS.includes(n) ? n : 30);
  }
}

/**
 * Lo llama el servidor de cada web pública (su ruta /api/hub/visita) en cada página vista: el marcaId lo pone ese
 * servidor (HUB_MARCA_ID) y reenvía la IP (x-forwarded-for) y el navegador (user-agent) del visitante.
 */
@Public()
@Controller('public/visitas')
export class PublicVisitasController {
  constructor(private readonly visitas: VisitasService) {}

  @Limite(120)
  @Post()
  @HttpCode(204)
  async registrar(@Query('marcaId') marcaId: string, @Body() dto: VisitaDto, @Req() req: Request): Promise<void> {
    const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() || req.ip || '';
    await this.visitas.registrar(marcaId, { ...dto, ip, ua: String(req.headers['user-agent'] ?? '') });
  }
}
