import { BadRequestException, Body, Controller, Delete, Get, Headers, Ip, Param, Patch, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ConocimientoService } from './conocimiento.service.js';
import { MAX_BYTES } from './conocimiento.parser.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

class RespuestaDto {
  @IsString() @MinLength(3) @MaxLength(300) pregunta!: string;
  @IsString() @MinLength(3) @MaxLength(3000) respuesta!: string;
  @IsOptional() @IsString() pendienteId?: string;
}
class ActualizarRespuestaDto {
  @IsOptional() @IsString() @MinLength(3) @MaxLength(300) pregunta?: string;
  @IsOptional() @IsString() @MinLength(3) @MaxLength(3000) respuesta?: string;
  @IsOptional() @IsBoolean() activo?: boolean;
}
class ActivoDto { @IsBoolean() activo!: boolean }
class PreguntaDto { @IsString() @MinLength(2) @MaxLength(300) pregunta!: string }
class InstruccionesDto { @IsString() @MaxLength(3000) texto!: string }

/** Dashboard → Chat y asesores → Conocimiento del asistente. */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'marketing', 'asesores')
@Controller('conocimiento')
export class ConocimientoController {
  constructor(private readonly conocimiento: ConocimientoService) {}

  @Get('documentos')
  documentos(@MarcaActual() marcaId: string) { return this.conocimiento.documentos(marcaId); }

  @Post('documentos')
  @UseInterceptors(FileInterceptor('archivo', { limits: { fileSize: MAX_BYTES, files: 1 } }))
  subir(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser, @UploadedFile() archivo?: { buffer: Buffer; size: number; originalname: string }) {
    return this.conocimiento.subir(marcaId, archivo, user.email);
  }

  @Get('documentos/:id/fragmentos')
  fragmentos(@MarcaActual() marcaId: string, @Param('id') id: string) { return this.conocimiento.fragmentosDe(marcaId, id); }

  @Patch('documentos/:id')
  alternar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActivoDto) { return this.conocimiento.alternarDocumento(marcaId, id, dto.activo); }

  @Delete('documentos/:id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) { return this.conocimiento.eliminarDocumento(marcaId, id); }

  @Get('respuestas')
  respuestas(@MarcaActual() marcaId: string) { return this.conocimiento.respuestas(marcaId); }

  @Post('respuestas')
  crear(@MarcaActual() marcaId: string, @Body() dto: RespuestaDto) { return this.conocimiento.crearRespuesta(marcaId, dto.pregunta, dto.respuesta, dto.pendienteId); }

  @Patch('respuestas/:id')
  actualizar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActualizarRespuestaDto) { return this.conocimiento.actualizarRespuesta(marcaId, id, dto); }

  @Delete('respuestas/:id')
  borrar(@MarcaActual() marcaId: string, @Param('id') id: string) { return this.conocimiento.eliminarRespuesta(marcaId, id); }

  @Get('pendientes')
  pendientes(@MarcaActual() marcaId: string) { return this.conocimiento.pendientes(marcaId); }

  @Patch('pendientes/:id/resolver')
  resolver(@MarcaActual() marcaId: string, @Param('id') id: string) { return this.conocimiento.resolverPendiente(marcaId, id); }

  /** Probador: qué fragmentos encontraría el asistente para esa pregunta (no registra pendientes). */
  @Post('probar')
  async probar(@MarcaActual() marcaId: string, @Body() dto: PreguntaDto) { return { fragmentos: await this.conocimiento.buscar(marcaId, dto.pregunta) }; }

  @Get('instrucciones')
  instrucciones(@MarcaActual() marcaId: string) { return this.conocimiento.instrucciones(marcaId); }

  @Roles('admin', 'marketing')
  @Put('instrucciones')
  guardarInstrucciones(@MarcaActual() marcaId: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: InstruccionesDto) {
    return this.conocimiento.guardarInstrucciones(marcaId, dto.texto, user.email);
  }
}

/** Lo consulta el asistente de la web pública (servidor a servidor, sin login). */
@Public()
@Controller('public/conocimiento')
export class PublicConocimientoController {
  constructor(private readonly conocimiento: ConocimientoService) {}

  @Post('consultar')
  consultar(@Query('marcaId') marcaId: string, @Body() dto: PreguntaDto, @Ip() ip: string, @Headers('x-forwarded-for') forwarded?: string) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.conocimiento.consultar(marcaId, dto.pregunta, forwarded?.split(',')[0]?.trim() || ip);
  }
}
