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
import { ServiciosService } from './servicios.service.js';
import { CreateServicioDto } from './dto/create-servicio.dto.js';
import { UpdateServicioDto } from './dto/update-servicio.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';

@UseGuards(JwtAuthGuard, MarcaRolGuard)
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Roles('admin', 'ventas')
  @Post()
  create(@MarcaActual() marcaId: string, @Body() dto: CreateServicioDto) {
    return this.serviciosService.create(marcaId, dto);
  }

  @Get()
  findAll(@MarcaActual() marcaId: string) {
    return this.serviciosService.findAll(marcaId);
  }

  @Get(':id')
  findOne(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.serviciosService.findOne(marcaId, id);
  }

  @Roles('admin', 'ventas')
  @Patch(':id')
  update(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: UpdateServicioDto) {
    return this.serviciosService.update(marcaId, id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.serviciosService.remove(marcaId, id);
  }
}
