import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MarcasService } from './marcas.service.js';
import { CreateMarcaDto } from './dto/create-marca.dto.js';
import { UpdateMarcaDto } from './dto/update-marca.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { SuperAdminGuard } from '../common/guards/super-admin.guard.js';
import { ActividadService } from '../actividad/actividad.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

/**
 * Marca (brand/tenant) management. Listing/creating brands is an
 * admin-level, cross-tenant operation, so only JwtAuthGuard applies here —
 * MarcaRolGuard (per-brand access) is used on read/update/delete routes
 * that operate on a specific marcaId.
 */
@UseGuards(JwtAuthGuard)
@Controller('marcas')
export class MarcasController {
  constructor(private readonly marcasService: MarcasService, private readonly actividad: ActividadService) {}

  private log(user: AuthenticatedUser, accion: string, detalle: string, marcaId?: string) {
    void this.actividad.registrar({ usuarioId: user.sub, email: user.email, accion, detalle, marcaId });
  }

  @UseGuards(SuperAdminGuard)
  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateMarcaDto) {
    return this.marcasService.create(dto).then((m) => { this.log(user, 'marca_creada', m.nombre, m.id); return m; });
  }

  /** Vista de gestión: cada marca con sus dominios y conteos. */
  @UseGuards(SuperAdminGuard)
  @Get('resumen')
  resumen() {
    return this.marcasService.resumen();
  }

  @Get()
  findAll() {
    return this.marcasService.findAll();
  }

  @UseGuards(MarcaRolGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marcasService.findOne(id);
  }

  @UseGuards(MarcaRolGuard)
  @Roles('admin')
  @Patch(':id')
  update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateMarcaDto) {
    return this.marcasService.update(id, dto).then((m) => { this.log(user, 'marca_editada', m.nombre, id); return m; });
  }

  @UseGuards(SuperAdminGuard)
  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.marcasService.remove(id).then((m) => { this.log(user, 'marca_eliminada', m.nombre, id); return m; });
  }
}
