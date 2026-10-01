import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ProductosService } from './productos.service.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
import { RenombrarMarcaComercialDto } from './dto/renombrar-marca.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';

/** Dashboard → Ecommerce → Catálogo: categorías y marcas comerciales (fabricantes). */
@UseGuards(JwtAuthGuard, MarcaRolGuard)
@Roles('admin', 'ventas')
@Controller('catalogo')
export class CatalogoController {
  constructor(private readonly productos: ProductosService) {}

  @Get('categorias')
  categorias(@MarcaActual() marcaId: string) {
    return this.productos.categoriasConConteo(marcaId);
  }

  @Patch('categorias/:id')
  updateCategoria(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: UpdateCategoriaDto) {
    return this.productos.updateCategoria(marcaId, id, dto);
  }

  @Roles('admin')
  @Delete('categorias/:id')
  removeCategoria(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.productos.removeCategoria(marcaId, id);
  }

  @Get('marcas-comerciales')
  marcasComerciales(@MarcaActual() marcaId: string) {
    return this.productos.marcasComerciales(marcaId);
  }

  @Patch('marcas-comerciales')
  renombrarMarca(@MarcaActual() marcaId: string, @Body() dto: RenombrarMarcaComercialDto) {
    return this.productos.renombrarMarcaComercial(marcaId, dto.desde, dto.hasta);
  }
}
