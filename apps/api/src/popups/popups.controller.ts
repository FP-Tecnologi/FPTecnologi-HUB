import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PopupsService } from './popups.service.js';
import { ActualizarPopupDto, CrearPopupDto, EventoPopupDto } from './popups.dto.js';
import { DISPARADORES, DISPOSITIVOS, FORMATOS_POPUP, FRECUENCIAS, PAGINAS_POPUP, PLANTILLAS } from './popups.modelo.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';

/** Dashboard → Web informativa → Popups. */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'marketing')
@Controller('popups')
export class PopupsController {
  constructor(private readonly popups: PopupsService) {}

  /** Plantillas con su contenido inicial y las opciones (formatos, disparadores, frecuencias, páginas) del editor. */
  @Get('plantillas')
  plantillas() {
    return { plantillas: PLANTILLAS, formatos: FORMATOS_POPUP, disparadores: DISPARADORES, frecuencias: FRECUENCIAS, dispositivos: DISPOSITIVOS, paginas: PAGINAS_POPUP };
  }

  @Get()
  list(@MarcaActual() marcaId: string) {
    return this.popups.list(marcaId);
  }

  @Post()
  crear(@MarcaActual() marcaId: string, @Body() dto: CrearPopupDto) {
    return this.popups.crear(marcaId, dto);
  }

  @Patch(':id')
  actualizar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActualizarPopupDto) {
    return this.popups.actualizar(marcaId, id, dto);
  }

  @Post(':id/duplicar')
  duplicar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.popups.duplicar(marcaId, id);
  }

  @Delete(':id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.popups.eliminar(marcaId, id);
  }
}

/** Lectura y conteo para la web pública, sin autenticación. */
@Public()
@Controller('public/popups')
export class PublicPopupsController {
  constructor(private readonly popups: PopupsService) {}

  @Get()
  ver(@Query('marcaId') marcaId: string, @Query('pagina') pagina = 'otras') {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.popups.publicos(marcaId, pagina);
  }

  @Post(':id/evento')
  evento(@Query('marcaId') marcaId: string, @Param('id') id: string, @Body() dto: EventoPopupDto) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.popups.registrarEvento(marcaId, id, dto.tipo);
  }
}
