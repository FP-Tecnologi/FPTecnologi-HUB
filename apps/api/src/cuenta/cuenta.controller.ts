import { BadRequestException, Body, Controller, Get, Headers, Ip, Param, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { CuentaService } from './cuenta.service.js';
import { Limite } from '../common/guards/limite-peticiones.guard.js';
import { Public } from '../common/decorators/public.decorator.js';

class PedirCodigoDto {
  @IsEmail()
  @MaxLength(120)
  email!: string;

  @IsOptional()
  @IsString()
  website?: string; // honeypot
}

class VerificarDto {
  @IsEmail()
  @MaxLength(120)
  email!: string;

  @IsString()
  @Length(6, 6)
  codigo!: string;
}

/** "Mi cuenta" del cliente (web pública, sin login de usuario): código por correo → token → sus pedidos y cotizaciones. */
@Public()
@Controller('public/cuenta')
export class CuentaController {
  constructor(private readonly cuenta: CuentaService) {}

  @Limite(5)
  @Post('codigo')
  codigo(@Query('marcaId') marcaId: string, @Body() dto: PedirCodigoDto, @Ip() ip: string, @Headers('x-forwarded-for') forwarded?: string) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    // Honeypot: se responde igual sin hacer nada.
    if (dto.website) return { enviado: true };
    return this.cuenta.pedirCodigo(marcaId, dto.email, forwarded?.split(',')[0]?.trim() || ip);
  }

  @Limite(8)
  @Post('verificar')
  verificar(@Query('marcaId') marcaId: string, @Body() dto: VerificarDto) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.cuenta.verificar(marcaId, dto.email, dto.codigo);
  }

  /** El token de sesión viaja en `x-cuenta-token` (lo pone el servidor de la web desde su cookie httpOnly). */
  @Get('resumen')
  resumen(@Query('marcaId') marcaId: string, @Headers('x-cuenta-token') token?: string) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.cuenta.resumen(marcaId, token);
  }

  /** PDF de una cotización ya enviada al cliente de esta sesión. */
  @Get('cotizaciones/:id/pdf')
  async cotizacionPdf(@Query('marcaId') marcaId: string, @Param('id') id: string, @Res() res: Response, @Headers('x-cuenta-token') token?: string) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    const { buffer, nombre } = await this.cuenta.cotizacionPdf(marcaId, token, id);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${nombre}"`, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store' });
    res.send(buffer);
  }
}
