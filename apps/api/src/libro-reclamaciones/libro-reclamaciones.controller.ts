import { Body, Controller, Get, Headers, Ip, Param, Patch, Post, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { LibroReclamacionesService } from './libro-reclamaciones.service.js';
import { ActualizarHojaDto, ConsultaHojaDto, CrearHojaDto, ResponderHojaDto } from './libro-reclamaciones.dto.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Limite } from '../common/guards/limite-peticiones.guard.js';
import { Public } from '../common/decorators/public.decorator.js';
import { EstadoHoja } from '../generated/prisma/enums.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

const textoCorto = (v: unknown, campo: string): string => {
  if (typeof v !== 'string' || !v.trim() || v.length > 40) throw new BadRequestException(`Falta o es inválido: ${campo}`);
  return v;
};

/** Dashboard: gestión de las hojas de reclamación (admin y comercial de la marca). */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'comercial')
@Controller('libro-reclamaciones')
export class LibroReclamacionesController {
  constructor(private readonly libro: LibroReclamacionesService) {}

  @Get()
  list(@MarcaActual() marcaId: string, @Query('estado') estado?: string, @Query('vencidas') vencidas?: string, @Query('q') q?: string) {
    if (estado && !(Object.values(EstadoHoja) as string[]).includes(estado)) throw new BadRequestException('Estado inválido');
    if (q !== undefined && (typeof q !== 'string' || q.length > 60)) throw new BadRequestException('Búsqueda inválida');
    return this.libro.list(marcaId, {
      estado: estado as EstadoHoja | undefined,
      vencidas: vencidas === 'true' || vencidas === '1',
      q,
    });
  }

  // Antes de ':id' para que "resumen" no se tome como un id.
  @Get('resumen')
  resumen(@MarcaActual() marcaId: string) {
    return this.libro.resumen(marcaId);
  }

  @Get(':id')
  get(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.libro.get(marcaId, id);
  }

  @Patch(':id')
  actualizar(
    @MarcaActual() marcaId: string,
    @Param('id') id: string,
    @Body() dto: ActualizarHojaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.libro.actualizar(marcaId, id, dto, user.email);
  }

  @Patch(':id/responder')
  responder(
    @MarcaActual() marcaId: string,
    @Param('id') id: string,
    @Body() dto: ResponderHojaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.libro.responder(marcaId, id, dto, user.email);
  }
}

/** Web pública (sin login): crear, consultar el estado y datos del proveedor. */
@Public()
@Controller('public/libro-reclamaciones')
export class PublicLibroReclamacionesController {
  constructor(private readonly libro: LibroReclamacionesService) {}

  @Limite(10)
  @Post()
  crear(
    @Query('marcaId') marcaId: string,
    @Body() dto: CrearHojaDto,
    @Ip() ip: string,
    @Headers('x-forwarded-for') forwarded?: string,
  ) {
    textoCorto(marcaId, 'marcaId');
    // Tope suave anti-spam: la IP real del visitante viaja en x-forwarded-for (web vía proxy).
    return this.libro.crearPublico(marcaId, dto, forwarded?.split(',')[0]?.trim() || ip);
  }

  // POST (no GET): el documento del consumidor no debe quedar en la URL ni en los logs de acceso.
  @Limite(30)
  @Post('consulta')
  consultar(
    @Query('marcaId') marcaId: string,
    @Body() dto: ConsultaHojaDto,
    @Ip() ip: string,
    @Headers('x-forwarded-for') forwarded?: string,
  ) {
    return this.libro.consultar(
      textoCorto(marcaId, 'marcaId'),
      dto.codigo,
      dto.documento,
      forwarded?.split(',')[0]?.trim() || ip,
    );
  }

  @Limite(60)
  @Get('proveedor')
  proveedor(@Query('marcaId') marcaId: string) {
    return this.libro.proveedor(textoCorto(marcaId, 'marcaId'));
  }
}
