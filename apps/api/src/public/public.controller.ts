import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator.js';
import { ProductosService } from '../productos/productos.service.js';
import { ServiciosService } from '../servicios/servicios.service.js';

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
  ) {}

  @Get('productos')
  productos(@Query('marcaId') marcaId: string, @Query('categoriaId') categoriaId?: string) {
    return this.productosService.findAll(marcaId, categoriaId, true);
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
