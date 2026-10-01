import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService, MAX_BYTES } from './uploads.service.js';
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
