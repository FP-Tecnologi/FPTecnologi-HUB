import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator.js';
import { ProductosService, type OrdenCatalogo } from '../productos/productos.service.js';
import { ServiciosService } from '../servicios/servicios.service.js';
import { MarcasService } from '../marcas/marcas.service.js';

/**
 * Endpoints de solo lectura, sin autenticación, para la web pública
 * (fptecnologi.com). Separados a propósito de /productos y /servicios (que
 * requieren JWT + rol) para que nunca quede expuesta por error una
 * operación de escritura ni datos de otra marca: aquí solo se listan
 * productos/servicios ACTIVOS de la marca pedida por query param.
 */
@Public()
@Controller('public')
export class PublicController {
  constructor(
    private readonly productosService: ProductosService,
    private readonly serviciosService: ServiciosService,
    private readonly marcasService: MarcasService,
  ) {}

  // Solo id+nombre — lo que necesita un formulario público (registro,
  // selector de tienda) para saber qué marcas existen, sin exponer nada
  // más del modelo Marca.
  @Get('marcas')
  async marcas() {
    const marcas = await this.marcasService.findAll();
    return marcas.map((m) => ({ id: m.id, nombre: m.nombre }));
  }

  @Get('categorias')
  categorias(@Query('marcaId') marcaId: string) {
    return this.productosService.findAllCategorias(marcaId, true);
  }

  @Get('categorias/:slug')
  categoria(@Query('marcaId') marcaId: string, @Param('slug') slug: string) {
    return this.productosService.findCategoriaPorSlug(marcaId, slug);
  }

  @Get('productos')
  productos(
    @Query('marcaId') marcaId: string,
    @Query('q') q?: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('categoria') categoriaSlug?: string,
    @Query('marca') marca?: string,
    @Query('minPrecio') minPrecio?: string,
    @Query('maxPrecio') maxPrecio?: string,
    @Query('ofertas') ofertas?: string,
    @Query('destacados') destacados?: string,
    @Query('orden') orden?: OrdenCatalogo,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const num = (v?: string) => (v !== undefined && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : undefined);
    const flag = (v?: string) => v === '1' || v === 'true' || v === 'si';
    return this.productosService.buscarPublico(marcaId, {
      q,
      categoriaId,
      categoriaSlug,
      marca,
      minPrecio: num(minPrecio),
      maxPrecio: num(maxPrecio),
      soloOfertas: flag(ofertas) || undefined,
      destacados: flag(destacados) || undefined,
      orden,
      page: num(page),
      limit: num(limit),
    });
  }

  // Ojo: esta ruta va ANTES de `productos/:id` para que `slug/…` no caiga
  // en el `:id` genérico.
  @Get('productos/slug/:slug')
  productoPorSlug(@Query('marcaId') marcaId: string, @Param('slug') slug: string) {
    return this.productosService.findBySlug(marcaId, slug, true);
  }

  @Get('productos/:id')
  producto(@Query('marcaId') marcaId: string, @Param('id') id: string) {
    return this.productosService.findOne(marcaId, id, true);
  }

  @Get('servicios')
  servicios(@Query('marcaId') marcaId: string) {
    return this.serviciosService.findAll(marcaId, true);
  }

  @Get('servicios/:id')
  servicio(@Query('marcaId') marcaId: string, @Param('id') id: string) {
    return this.serviciosService.findOne(marcaId, id, true);
  }
}
