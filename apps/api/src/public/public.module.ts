import { Module } from '@nestjs/common';
import { PublicController } from './public.controller.js';
import { ProductosModule } from '../productos/productos.module.js';
import { ServiciosModule } from '../servicios/servicios.module.js';
import { MarcasModule } from '../marcas/marcas.module.js';
import { ProyectosModule } from '../proyectos/proyectos.module.js';
import { ClientesModule } from '../clientes/clientes.module.js';

@Module({
  imports: [ProductosModule, ServiciosModule, MarcasModule, ProyectosModule, ClientesModule],
  controllers: [PublicController],
})
export class PublicApiModule {}
