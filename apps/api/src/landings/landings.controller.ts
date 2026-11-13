import { BadRequestException, Body, Controller, Delete, Get, Headers, Ip, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { type Actor, LandingsService } from './landings.service.js';
import { ActualizarLandingDto, CrearLandingDto, RechazarLandingDto, RegistroPublicoDto } from './landings.dto.js';
import { FORMULARIOS, PLANTILLAS, TIPOS_CAMPO } from './landings.modelo.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

const actorDe = (user: AuthenticatedUser, marcaId: string): Actor => ({ id: user.sub, email: user.email, rol: user.marcas.find((m) => m.marcaId === marcaId)?.rol ?? '' });

/** Dashboard → Campañas → Landing pages. */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'marketing', 'comercial', 'jefe_comercial')
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

  /** Landings que un comercial envió y esperan aprobación. */
  @Roles('admin', 'jefe_comercial')
  @Get('revision')
  pendientes(@MarcaActual() marcaId: string) {
    return this.landings.pendientes(marcaId);
  }

  @Get()
  list(@MarcaActual() marcaId: string) {
    return this.landings.list(marcaId);
  }

  @Post()
  crear(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: CrearLandingDto) {
    return this.landings.crear(marcaId, dto, actorDe(user, marcaId));
  }

  @Get(':id')
  get(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.landings.get(marcaId, id);
  }

  @Patch(':id')
  actualizar(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: ActualizarLandingDto) {
    return this.landings.actualizar(marcaId, id, dto, actorDe(user, marcaId));
  }

  @Post(':id/enviar-revision')
  enviarRevision(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.landings.enviarRevision(marcaId, id, actorDe(user, marcaId));
  }

  @Roles('admin', 'jefe_comercial')
  @Post(':id/aprobar')
  aprobar(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.landings.aprobar(marcaId, id, actorDe(user, marcaId));
  }

  @Roles('admin', 'jefe_comercial')
  @Post(':id/rechazar')
  rechazar(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: RechazarLandingDto) {
    return this.landings.rechazar(marcaId, id, dto.comentario, actorDe(user, marcaId));
  }

  @Post(':id/duplicar')
  duplicar(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.landings.duplicar(marcaId, id, actorDe(user, marcaId));
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
