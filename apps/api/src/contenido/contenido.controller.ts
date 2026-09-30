import { BadRequestException, Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { IsObject } from 'class-validator';
import { ContenidoService } from './contenido.service.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

class GuardarSeccionDto {
  @IsObject()
  datos!: Record<string, unknown>;
}

// Nombres de página/sección: solo minúsculas, números y guiones.
const SLUG = /^[a-z0-9-]{1,40}$/;
const MAX_JSON = 50_000;

function slug(v: string, campo: string) {
  if (!SLUG.test(v)) throw new BadRequestException(`${campo} inválido`);
  return v;
}

/** Dashboard: CMS de las webs públicas (admin y marketing de la marca). */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'marketing')
@Controller('contenido')
export class ContenidoController {
  constructor(private readonly contenido: ContenidoService) {}

  @Get(':pagina')
  pagina(@MarcaActual() marcaId: string, @Param('pagina') pagina: string) {
    return this.contenido.pagina(marcaId, slug(pagina, 'pagina'));
  }

  @Put(':pagina/:seccion')
  guardar(
    @MarcaActual() marcaId: string,
    @Param('pagina') pagina: string,
    @Param('seccion') seccion: string,
    @Body() dto: GuardarSeccionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (JSON.stringify(dto.datos).length > MAX_JSON) throw new BadRequestException('El contenido es demasiado grande');
    return this.contenido.guardar(marcaId, slug(pagina, 'pagina'), slug(seccion, 'seccion'), dto.datos, user.email);
  }
}

/** Web pública: lee el contenido guardado de una página (sin login). */
@Public()
@Controller('public/contenido')
export class PublicContenidoController {
  constructor(private readonly contenido: ContenidoService) {}

  @Get(':pagina')
  pagina(@Query('marcaId') marcaId: string, @Param('pagina') pagina: string) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.contenido.pagina(marcaId, slug(pagina, 'pagina'));
  }
}
