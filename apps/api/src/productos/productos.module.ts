import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service.js';
import { ProductosController } from './productos.controller.js';
import { CatalogoController } from './catalogo.controller.js';

@Module({
  controllers: [ProductosController, CatalogoController],
  providers: [ProductosService],
  exports: [ProductosService],
})
export class ProductosModule {}
