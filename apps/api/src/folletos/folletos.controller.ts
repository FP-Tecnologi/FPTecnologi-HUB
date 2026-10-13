import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { FolletosService } from './folletos.service.js';
import { MAX_BYTES_CATALOGO } from '../uploads/uploads.service.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { Limite } from '../common/guards/limite-peticiones.guard.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

class CrearFolletoDto {
  @IsString() @MinLength(2) @MaxLength(120)
  titulo!: string;
}

class ActualizarFolletoDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120)
  titulo?: string;

  @IsOptional() @IsBoolean()
  activo?: boolean;
}

/** Dashboard → Web → Folletos: el equipo (comercial incluido) sube PDF y comparte su enlace. */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'marketing', 'comercial')
@Controller('folletos')
export class FolletosController {
  constructor(private readonly folletos: FolletosService) {}

  @Get()
  listar(@MarcaActual() marcaId: string) {
    return this.folletos.listar(marcaId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('archivo', { limits: { fileSize: MAX_BYTES_CATALOGO, files: 1 } }))
  crear(@MarcaActual() marcaId: string, @Body() dto: CrearFolletoDto, @CurrentUser() user: AuthenticatedUser, @UploadedFile() archivo?: { buffer: Buffer; size: number }) {
    return this.folletos.crear(marcaId, dto.titulo, archivo, user.email);
  }

  @Patch(':id')
  actualizar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActualizarFolletoDto) {
    return this.folletos.actualizar(marcaId, id, dto);
  }

  @Delete(':id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.folletos.eliminar(marcaId, id);
  }
}

/** Web pública: el folleto se ve sin iniciar sesión (es para compartir por enlace). */
@Public()
@Controller('public/folletos')
export class PublicFolletosController {
  constructor(private readonly folletos: FolletosService) {}

  @Limite(120)
  @Get(':slug')
  ver(@Query('marcaId') marcaId: string, @Param('slug') slug: string) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.folletos.ver(marcaId, slug);
  }
}
