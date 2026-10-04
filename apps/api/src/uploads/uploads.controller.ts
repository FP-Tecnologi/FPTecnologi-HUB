import { BadRequestException, Controller, Headers, Ip, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService, MAX_BYTES, MAX_BYTES_EVIDENCIA } from './uploads.service.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';

/** Subida de imágenes desde el dashboard (productos, categorías, blog, landings…). Solo equipo autorizado. */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'ventas', 'marketing', 'comercial')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('archivo', { limits: { fileSize: MAX_BYTES, files: 1 } }))
  subir(@MarcaActual() marcaId: string, @UploadedFile() archivo?: { buffer: Buffer; size: number }) {
    return this.uploads.guardarImagen(marcaId, archivo);
  }
}

/** Evidencia de tickets de soporte desde la web pública (imágenes o PDF, con tope por IP). */
@Public()
@Controller('public/uploads')
export class PublicUploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('evidencia')
  @UseInterceptors(FileInterceptor('archivo', { limits: { fileSize: MAX_BYTES_EVIDENCIA, files: 1 } }))
  evidencia(
    @Query('marcaId') marcaId: string,
    @UploadedFile() archivo: { buffer: Buffer; size: number } | undefined,
    @Ip() ip: string,
    @Headers('x-forwarded-for') forwarded?: string,
  ) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.uploads.guardarEvidencia(marcaId, forwarded?.split(',')[0]?.trim() || ip, archivo);
  }
}
