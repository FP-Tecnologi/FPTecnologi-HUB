import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecursosService } from './recursos.service.js';
import { ActualizarRecursoDto, ActualizarSocioDto, CrearRecursoDto, CrearSocioDto } from './recursos.dto.js';
import { UploadsService, MAX_BYTES_RECURSO } from '../uploads/uploads.service.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Limite } from '../common/guards/limite-peticiones.guard.js';
import { Public } from '../common/decorators/public.decorator.js';

/** Web pública /recursos: material de marcas para socios (requiere sesión de «Mi cuenta» de un socio activo). */
@Public()
@Controller('public/recursos')
export class PublicRecursosController {
  constructor(private readonly recursos: RecursosService) {}

  @Limite(60)
  @Get()
  listar(@Query('marcaId') marcaId: string, @Headers('x-cuenta-token') token?: string) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.recursos.listarParaSocio(marcaId, token);
  }
}

/** Dashboard → Recursos: sube y gestiona el material y la lista de socios autorizados. */
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
  crearSocio(@MarcaActual() marcaId: string, @Body() dto: CrearSocioDto) {
    return this.recursos.crearSocio(marcaId, dto);
  }

  @Patch('socios/:id')
  actualizarSocio(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActualizarSocioDto) {
    return this.recursos.actualizarSocio(marcaId, id, dto);
  }

  @Roles('admin', 'comercial')
  @Delete('socios/:id')
  eliminarSocio(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.recursos.eliminarSocio(marcaId, id);
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
