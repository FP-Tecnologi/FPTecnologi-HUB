import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductosService } from './productos.service.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';

@UseGuards(JwtAuthGuard, MarcaRolGuard)
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Roles('admin', 'ventas')
  @Post()
  create(@MarcaActual() marcaId: string, @Body() dto: CreateProductoDto) {
    return this.productosService.create(marcaId, dto);
  }

  @Get()
  findAll(@MarcaActual() marcaId: string, @Query('categoriaId') categoriaId?: string) {
    return this.productosService.findAll(marcaId, categoriaId);
  }

  @Get(':id')
  findOne(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.productosService.findOne(marcaId, id);
  }

  @Roles('admin', 'ventas')
  @Patch(':id')
  update(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: UpdateProductoDto) {
    return this.productosService.update(marcaId, id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.productosService.remove(marcaId, id);
  }

  @Roles('admin', 'ventas')
  @Post('categorias')
  createCategoria(@MarcaActual() marcaId: string, @Body() dto: CreateCategoriaDto) {
    return this.productosService.createCategoria(marcaId, dto);
  }

  @Get('categorias/todas')
  findAllCategorias(@MarcaActual() marcaId: string) {
    return this.productosService.findAllCategorias(marcaId);
  }
}
