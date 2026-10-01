import { BadRequestException, Body, Controller, Delete, Get, Headers, Ip, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { LandingsService } from './landings.service.js';
import { ActualizarLandingDto, CrearLandingDto, RegistroPublicoDto } from './landings.dto.js';
import { FORMULARIOS, PLANTILLAS, TIPOS_CAMPO } from './landings.modelo.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';

/** Dashboard → Campañas → Landing pages. */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'marketing', 'comercial')
@Controller('landings')
export class LandingsController {
  constructor(private readonly landings: LandingsService) {}

  /** Plantillas, formularios prediseñados y tipos de campo disponibles para el editor. */
  @Get('plantillas')
  plantillas() {
    return {
      plantillas: PLANTILLAS,
      formularios: Object.entries(FORMULARIOS).map(([id, f]) => ({ id, ...f })),
      tiposCampo: TIPOS_CAMPO,
    };
  }

  @Get()
  list(@MarcaActual() marcaId: string) {
    return this.landings.list(marcaId);
  }

  @Post()
  crear(@MarcaActual() marcaId: string, @Body() dto: CrearLandingDto) {
    return this.landings.crear(marcaId, dto);
  }

  @Get(':id')
  get(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.landings.get(marcaId, id);
  }

  @Patch(':id')
  actualizar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActualizarLandingDto) {
    return this.landings.actualizar(marcaId, id, dto);
  }

  @Post(':id/duplicar')
  duplicar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.landings.duplicar(marcaId, id);
  }

  @Post(':id/vista-previa')
  async vistaPrevia(@MarcaActual() marcaId: string, @Param('id') id: string) {
    const l = await this.landings.get(marcaId, id);
    return { slug: l.slug, token: this.landings.tokenVistaPrevia(l.id) };
  }

  @Roles('admin', 'marketing')
  @Delete(':id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.landings.eliminar(marcaId, id);
  }

  @Get(':id/registros')
  registros(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.landings.registros(marcaId, id);
  }

  @Roles('admin', 'marketing')
  @Delete(':id/registros/:registroId')
  eliminarRegistro(@MarcaActual() marcaId: string, @Param('id') id: string, @Param('registroId') registroId: string) {
    return this.landings.eliminarRegistro(marcaId, id, registroId);
  }
}

/** Páginas públicas (sin login): la landing y su formulario de registro. */
@Public()
@Controller('public/landings')
export class PublicLandingsController {
  constructor(private readonly landings: LandingsService) {}

  @Get(':slug')
  ver(@Query('marcaId') marcaId: string, @Param('slug') slug: string, @Query('preview') preview?: string) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.landings.publica(marcaId, slug, preview);
  }

  @Post(':slug/registro')
  registrar(
    @Query('marcaId') marcaId: string,
    @Param('slug') slug: string,
    @Body() dto: RegistroPublicoDto,
    @Ip() ip: string,
    @Headers('x-forwarded-for') forwarded?: string,
  ) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.landings.registrar(marcaId, slug, dto, forwarded?.split(',')[0]?.trim() || ip);
  }
}
