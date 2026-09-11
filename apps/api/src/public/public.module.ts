import { Module } from '@nestjs/common';
import { PublicController } from './public.controller.js';
import { ProductosModule } from '../productos/productos.module.js';
import { ServiciosModule } from '../servicios/servicios.module.js';
import { MarcasModule } from '../marcas/marcas.module.js';

@Module({
  imports: [ProductosModule, ServiciosModule, MarcasModule],
  controllers: [PublicController],
})
export class PublicApiModule {}
