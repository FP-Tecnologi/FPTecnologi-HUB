import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
// TODO(THROTTLER): ver nota en auth.controller.ts -- @nestjs/throttler no
// tiene build compatible con @nestjs/common@12 (ESM). Deshabilitado hasta
// que el paquete lo arregle.
// import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './health.controller.js';
import { ConfigModule } from './config/config.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { AuthModule } from './auth/auth.module.js';
import { MarcasModule } from './marcas/marcas.module.js';
import { SitiosModule } from './sitios/sitios.module.js';
import { RolesModule } from './roles/roles.module.js';
import { ProductosModule } from './productos/productos.module.js';
import { PedidosModule } from './pedidos/pedidos.module.js';
import { ServiciosModule } from './servicios/servicios.module.js';
import { CotizacionesModule } from './cotizaciones/cotizaciones.module.js';
import { NotificacionesModule } from './notificaciones/notificaciones.module.js';
import { PublicApiModule } from './public/public.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { ChatModule } from './chat/chat.module.js';
import { BoletinModule } from './boletin/boletin.module.js';
import { InvitacionesModule } from './invitaciones/invitaciones.module.js';
import { CotizadorModule } from './cotizador/cotizador.module.js';
import { ClientesTiendaModule } from './clientes-tienda/clientes-tienda.module.js';
import { CampanasModule } from './campanas/campanas.module.js';
import { LandingsModule } from './landings/landings.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { EnviosModule } from './envios/envios.module.js';
import { ContactoWebModule } from './contacto-web/contacto-web.module.js';
import { ContenidoModule } from './contenido/contenido.module.js';
import { BlogModule } from './blog/blog.module.js';
import { ProyectosModule } from './proyectos/proyectos.module.js';
import { ClientesModule } from './clientes/clientes.module.js';

@Module({
  imports: [
    ConfigModule,
    // Límite global; auth.controller pone uno más estricto en login/OTP
    // (fuerza bruta de un código de 6 dígitos es factible sin esto).
    // Deshabilitado -- ver TODO(THROTTLER) arriba.
    // ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    MarcasModule,
    SitiosModule,
    RolesModule,
    ProductosModule,
    PedidosModule,
    ServiciosModule,
    CotizacionesModule,
    NotificacionesModule,
    PublicApiModule,
    UsuariosModule,
    ChatModule,
    ContenidoModule,
    CotizadorModule,
    ContactoWebModule,
    EnviosModule,
    UploadsModule,
    CampanasModule,
    LandingsModule,
    ClientesTiendaModule,
    BoletinModule,
    InvitacionesModule,
    BlogModule,
    ProyectosModule,
    ClientesModule,
  ],
  controllers: [HealthController],
  providers: [
    // Orden de ejecución de guards: JwtAuthGuard corre primero en todas las
    // rutas (salvo @Public()); MarcaRolGuard se aplica explícitamente por
    // módulo/ruta encima de este guard global.
    // Deshabilitado -- ver TODO(THROTTLER) arriba.
    // { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
