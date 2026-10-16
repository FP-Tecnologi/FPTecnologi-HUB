import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { TarjetasService } from './tarjetas.service.js';
import { ActivarTarjetaDto, GuardarTarjetaDto, QrPreviaDto } from './tarjetas.dto.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { Limite } from '../common/guards/limite-peticiones.guard.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

/** Dashboard → Mi tarjeta digital: cada persona del equipo, de cualquier área, edita la suya. */
// Sin lista de roles: cualquier persona del equipo (de cualquier área) con acceso a la marca puede tener su tarjeta.
@UseGuards(MarcaRolGuard)
@Controller('tarjetas')
export class TarjetasController {
  constructor(private readonly tarjetas: TarjetasService) {}

  /** Los clientes de la tienda también tienen una asignación en la marca (rol «cliente»): no son equipo. */
  private soloEquipo(user: AuthenticatedUser, marcaId: string) {
    if (user.marcas.find((m) => m.marcaId === marcaId)?.rol === 'cliente') throw new ForbiddenException('La tarjeta digital es para el equipo');
  }

  @Get('mias')
  mias(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser) {
    this.soloEquipo(user, marcaId);
    return this.tarjetas.mias(marcaId, user.sub);
  }

  /** QR de muestra con los colores elegidos (vista previa del editor). */
  @Post('qr')
  qr(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: QrPreviaDto) {
    this.soloEquipo(user, marcaId);
    return this.tarjetas.qrPrevia(dto);
  }

  /** Nueva versión de mi tarjeta (p. ej. una para el área comercial y otra para soporte). */
  @Post('mias')
  crear(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: GuardarTarjetaDto) {
    this.soloEquipo(user, marcaId);
    return this.tarjetas.guardarMia(marcaId, user.sub, dto, { nueva: true });
  }

  @Put('mias/:id')
  guardar(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: GuardarTarjetaDto) {
    this.soloEquipo(user, marcaId);
    return this.tarjetas.guardarMia(marcaId, user.sub, dto, { id });
  }

  @Delete('mias/:id')
  eliminar(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    this.soloEquipo(user, marcaId);
    return this.tarjetas.eliminarMia(marcaId, user.sub, id);
  }

  /** Todas las tarjetas del equipo (solo quien administra la web). */
  @Roles('admin', 'marketing')
  @Get()
  listar(@MarcaActual() marcaId: string) {
    return this.tarjetas.listar(marcaId);
  }

  /** Crear la tarjeta de alguien sin cuenta en la plataforma (externa). */
  @Roles('admin', 'marketing')
  @Post('externa')
  crearExterna(@MarcaActual() marcaId: string, @Body() dto: GuardarTarjetaDto) {
    return this.tarjetas.guardarComoAdmin(marcaId, dto, { externa: true });
  }

  /** Crear la tarjeta de alguien del equipo que aún no la tiene. */
  @Roles('admin', 'marketing')
  @Post('para/:usuarioId')
  crearPara(@MarcaActual() marcaId: string, @Param('usuarioId') usuarioId: string, @Body() dto: GuardarTarjetaDto) {
    return this.tarjetas.guardarComoAdmin(marcaId, dto, { usuarioId });
  }

  /** Editar la tarjeta de cualquier persona del equipo. */
  @Roles('admin', 'marketing')
  @Put(':id')
  editar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: GuardarTarjetaDto) {
    return this.tarjetas.guardarComoAdmin(marcaId, dto, { id });
  }

  @Roles('admin', 'marketing')
  @Patch(':id/activo')
  activar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActivarTarjetaDto) {
    return this.tarjetas.activar(marcaId, id, dto.activo);
  }
}

/** Web pública: la tarjeta se ve sin iniciar sesión (es para compartir por QR o enlace). */
@Public()
@Controller('public/tarjetas')
export class PublicTarjetasController {
  constructor(private readonly tarjetas: TarjetasService) {}

  @Limite(120)
  @Get(':slug')
  ver(@Query('marcaId') marcaId: string, @Param('slug') slug: string) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.tarjetas.ver(marcaId, slug);
  }

  /** «Guardar contacto»: archivo .vcf para la agenda del celular. */
  @Limite(60)
  @Get(':slug/vcard')
  async vcard(@Query('marcaId') marcaId: string, @Param('slug') slug: string, @Res() res: Response) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    const { nombre, contenido } = await this.tarjetas.vcard(marcaId, slug);
    res.set({ 'Content-Type': 'text/vcard; charset=utf-8', 'Content-Disposition': `attachment; filename="${nombre}"`, 'X-Content-Type-Options': 'nosniff' });
    res.send(contenido);
  }
}
