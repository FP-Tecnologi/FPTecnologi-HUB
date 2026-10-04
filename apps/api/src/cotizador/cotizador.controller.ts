import { Body, Controller, Delete, Get, Headers, Ip, Param, Patch, Post, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { CotizadorService } from './cotizador.service.js';
import { ActualizarLeadDto, CrearLeadDto } from './cotizador.dto.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Limite } from '../common/guards/limite-peticiones.guard.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

/** Dashboard: gestión de los leads del cotizador (admin y comercial de la marca). */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'comercial')
@Controller('cotizador/leads')
export class CotizadorController {
  constructor(private readonly cotizador: CotizadorService) {}

  @Get()
  list(@MarcaActual() marcaId: string) {
    return this.cotizador.list(marcaId);
  }

  @Get(':id')
  get(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.cotizador.get(marcaId, id);
  }

  @Patch(':id')
  actualizar(
    @MarcaActual() marcaId: string,
    @Param('id') id: string,
    @Body() dto: ActualizarLeadDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cotizador.actualizar(marcaId, id, dto, user.email);
  }

  @Delete(':id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.cotizador.eliminar(marcaId, id);
  }
}

/** Web pública (sin login): el formulario del cotizador envía el lead acá. */
@Public()
@Controller('public/cotizador')
export class PublicCotizadorController {
  constructor(private readonly cotizador: CotizadorService) {}

  @Limite(10)
  @Post('leads')
  crear(
    @Query('marcaId') marcaId: string,
    @Body() dto: CrearLeadDto,
    @Ip() ip: string,
    @Headers('x-forwarded-for') forwarded?: string,
  ) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    // La web pública llama vía su proxy: la IP real del visitante viaja en x-forwarded-for.
    // Es un tope suave anti-spam (no una barrera de seguridad), por eso no se exige un proxy de confianza.
    return this.cotizador.crearPublico(marcaId, dto, forwarded?.split(',')[0]?.trim() || ip);
  }
}
