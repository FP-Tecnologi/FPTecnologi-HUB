import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { RecursosService } from './recursos.service.js';
import { ActualizarRecursoDto, ActualizarSocioDto, CrearRecursoDto, CrearSocioDto, RegistroSocioDto } from './recursos.dto.js';
import { UploadsService, MAX_BYTES_RECURSO } from '../uploads/uploads.service.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Limite } from '../common/guards/limite-peticiones.guard.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

const exigeMarca = (marcaId: string) => {
  if (!marcaId) throw new BadRequestException('Falta marcaId');
};

/** Intranet de socios (web /socios): registro público y, con sesión de «Mi cuenta» de un socio ACTIVO, recursos y tickets. */
@Public()
@Controller('public/socios')
export class PublicSociosController {
  constructor(private readonly recursos: RecursosService) {}

  @Limite(5)
  @Post('registro')
  registro(@Query('marcaId') marcaId: string, @Body() dto: RegistroSocioDto) {
    exigeMarca(marcaId);
    return this.recursos.registrar(marcaId, dto);
  }

  @Limite(60)
  @Get('estado')
  estado(@Query('marcaId') marcaId: string, @Headers('x-cuenta-token') token?: string) {
    exigeMarca(marcaId);
    return this.recursos.estadoDeSesion(marcaId, token);
  }

  @Limite(60)
  @Get('portal')
  portal(@Query('marcaId') marcaId: string, @Headers('x-cuenta-token') token?: string) {
    exigeMarca(marcaId);
    return this.recursos.portal(marcaId, token);
  }

  /** Archivo privado: la web lo pide por su proxy (que pone el token de la cookie httpOnly); nunca es una URL pública. */
  @Limite(120)
  @Get('recursos/:id/archivo')
  archivo(@Query('marcaId') marcaId: string, @Param('id') id: string, @Query('inline') inline: string | undefined, @Headers('x-cuenta-token') token: string | undefined, @Res() res: Response) {
    exigeMarca(marcaId);
    return this.recursos.descargar(marcaId, token, id, res, inline === '1');
  }
}

/** Dashboard → Web → Recursos: sube y gestiona el material y los socios (acceso, aprobación). */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'marketing', 'comercial')
@Controller('recursos')
export class RecursosController {
  constructor(
    private readonly recursos: RecursosService,
    private readonly uploads: UploadsService,
  ) {}

  @Get()
  listar(@MarcaActual() marcaId: string) {
    return this.recursos.listar(marcaId);
  }

  @Post('archivo')
  @UseInterceptors(FileInterceptor('archivo', { limits: { fileSize: MAX_BYTES_RECURSO, files: 1 } }))
  subir(@MarcaActual() marcaId: string, @UploadedFile() archivo?: { buffer: Buffer; size: number; originalname?: string }) {
    return this.uploads.guardarRecurso(marcaId, archivo);
  }

  @Post()
  crear(@MarcaActual() marcaId: string, @Body() dto: CrearRecursoDto) {
    return this.recursos.crear(marcaId, dto);
  }

  @Get('socios')
  listarSocios(@MarcaActual() marcaId: string) {
    return this.recursos.listarSocios(marcaId);
  }

  @Post('socios')
  crearSocio(@MarcaActual() marcaId: string, @Body() dto: CrearSocioDto, @CurrentUser() user: AuthenticatedUser) {
    return this.recursos.crearSocio(marcaId, dto, user.email);
  }

  @Patch('socios/:id')
  actualizarSocio(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActualizarSocioDto, @CurrentUser() user: AuthenticatedUser) {
    return this.recursos.actualizarSocio(marcaId, id, dto, user.email);
  }

  @Roles('admin', 'comercial')
  @Delete('socios/:id')
  eliminarSocio(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.recursos.eliminarSocio(marcaId, id);
  }

  @Get(':id/archivo')
  archivo(@MarcaActual() marcaId: string, @Param('id') id: string, @Res() res: Response) {
    return this.recursos.archivoParaEquipo(marcaId, id, res);
  }

  @Patch(':id')
  actualizar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActualizarRecursoDto) {
    return this.recursos.actualizar(marcaId, id, dto);
  }

  @Delete(':id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.recursos.eliminar(marcaId, id);
  }
}
