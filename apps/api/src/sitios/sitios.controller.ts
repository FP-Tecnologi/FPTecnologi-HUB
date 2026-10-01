import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SitiosService } from './sitios.service.js';
import { CreateSitioDto } from './dto/create-sitio.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';

@Controller('sitios')
export class SitiosController {
  constructor(private readonly sitiosService: SitiosService) {}

  @UseGuards(JwtAuthGuard, MarcaRolGuard)
  @Roles('admin')
  @Post()
  create(@MarcaActual() marcaId: string, @Body() dto: CreateSitioDto) {
    return this.sitiosService.create(marcaId, dto);
  }

  @UseGuards(JwtAuthGuard, MarcaRolGuard)
  @Get()
  findAll(@MarcaActual() marcaId: string) {
    return this.sitiosService.findAll(marcaId);
  }

  // Resuelve qué marca corresponde a un dominio; lo usa la web pública para
  // saber con qué marcaId pedir su catálogo, sin requerir autenticación.
  @Public()
  @Get('resolver/:dominio')
  resolver(@Param('dominio') dominio: string) {
    return this.sitiosService.findByDominio(dominio);
  }

  @UseGuards(JwtAuthGuard, MarcaRolGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.sitiosService.remove(marcaId, id);
  }
}
