import { Module } from '@nestjs/common';
import { PanelController } from './panel.controller.js';
import { PanelService } from './panel.service.js';
import { PedidosModule } from '../pedidos/pedidos.module.js';
import { CotizadorModule } from '../cotizador/cotizador.module.js';
import { CotizacionesModule } from '../cotizaciones/cotizaciones.module.js';
import { ChatModule } from '../chat/chat.module.js';
import { BlogModule } from '../blog/blog.module.js';
import { ProductosModule } from '../productos/productos.module.js';
import { BoletinModule } from '../boletin/boletin.module.js';
import { ContactoWebModule } from '../contacto-web/contacto-web.module.js';
import { RolesModule } from '../roles/roles.module.js';
import { VisitasModule } from '../visitas/visitas.module.js';

@Module({
  imports: [
    PedidosModule, CotizadorModule, CotizacionesModule, ChatModule, BlogModule,
    ProductosModule, BoletinModule, ContactoWebModule, RolesModule, VisitasModule,
  ],
  controllers: [PanelController],
  providers: [PanelService],
})
export class PanelModule {}
