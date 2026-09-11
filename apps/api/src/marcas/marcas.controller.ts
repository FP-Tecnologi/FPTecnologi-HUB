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

/**
 * Marca (brand/tenant) management. Listing/creating brands is an
 * admin-level, cross-tenant operation, so only JwtAuthGuard applies here —
 * MarcaRolGuard (per-brand access) is used on read/update/delete routes
 * that operate on a specific marcaId.
 */
@UseGuards(JwtAuthGuard)
@Controller('marcas')
export class MarcasController {
  constructor(private readonly marcasService: MarcasService) {}

  @Post()
  create(@Body() dto: CreateMarcaDto) {
    return this.marcasService.create(dto);
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
  update(@Param('id') id: string, @Body() dto: UpdateMarcaDto) {
    return this.marcasService.update(id, dto);
  }

  @UseGuards(MarcaRolGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marcasService.remove(id);
  }
}
