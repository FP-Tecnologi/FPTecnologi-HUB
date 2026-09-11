import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { SitiosService } from './sitios.service.js';
import { CreateSitioDto } from './dto/create-sitio.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { Public } from '../common/decorators/public.decorator.js';

@Controller('sitios')
export class SitiosController {
  constructor(private readonly sitiosService: SitiosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateSitioDto) {
    return this.sitiosService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('marcaId') marcaId?: string) {
    return this.sitiosService.findAll(marcaId);
  }

  // Resuelve qué marca corresponde a un dominio; lo usa la web pública para
  // saber con qué marcaId pedir su catálogo, sin requerir autenticación.
  @Public()
  @Get('resolver/:dominio')
  resolver(@Param('dominio') dominio: string) {
    return this.sitiosService.findByDominio(dominio);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sitiosService.remove(id);
  }
}
