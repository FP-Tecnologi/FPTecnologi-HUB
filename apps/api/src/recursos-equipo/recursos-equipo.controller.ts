import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { RecursosEquipoService } from './recursos-equipo.service.js';
import { ActualizarRecursoEquipoDto, CrearRecursoEquipoDto } from './recursos-equipo.dto.js';
import { MAX_BYTES_EQUIPO } from './formatos.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Limite } from '../common/guards/limite-peticiones.guard.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

/**
 * Biblioteca interna del equipo: cualquier usuario con sesión ve, descarga y sube (es de todas las marcas, sin
 * `MarcaRolGuard`). Editar o borrar: quien lo subió o un administrador.
 */
@Controller('recursos-equipo')
export class RecursosEquipoController {
  constructor(private readonly recursos: RecursosEquipoService) {}

  @Get()
  listar(@CurrentUser() user: AuthenticatedUser) {
    return this.recursos.listar(user);
  }

  @Limite(60)
  @Post()
  @UseInterceptors(FileInterceptor('archivo', { limits: { fileSize: MAX_BYTES_EQUIPO, files: 1 } }))
  crear(@CurrentUser() user: AuthenticatedUser, @Body() dto: CrearRecursoEquipoDto, @UploadedFile() archivo?: { buffer: Buffer; size: number; originalname?: string }) {
    return this.recursos.crear(user, dto, archivo);
  }

  @Get(':id/archivo')
  archivo(@Param('id', ParseUUIDPipe) id: string, @Query('inline') inline: string | undefined, @Res() res: Response) {
    return this.recursos.enviar(id, res, inline === '1');
  }

  @Patch(':id')
  actualizar(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ActualizarRecursoEquipoDto) {
    return this.recursos.actualizar(user, id, dto);
  }

  @Delete(':id')
  eliminar(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.recursos.eliminar(user, id);
  }
}
