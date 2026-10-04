import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { LimitePeticionesGuard } from './common/guards/limite-peticiones.guard.js';
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
import { PresupuestosModule } from './presupuestos/presupuestos.module.js';
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
import { ReportesModule } from './reportes/reportes.module.js';
import { CuentaModule } from './cuenta/cuenta.module.js';
import { ConocimientoModule } from './conocimiento/conocimiento.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { EnviosModule } from './envios/envios.module.js';
import { ContactoWebModule } from './contacto-web/contacto-web.module.js';
import { ContenidoModule } from './contenido/contenido.module.js';
import { BlogModule } from './blog/blog.module.js';
import { ProyectosModule } from './proyectos/proyectos.module.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { PopupsModule } from './popups/popups.module.js';
import { TicketsModule } from './tickets/tickets.module.js';
import { RecursosModule } from './recursos/recursos.module.js';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    MarcasModule,
    SitiosModule,
    RolesModule,
    ProductosModule,
    PedidosModule,
    ServiciosModule,
    CotizacionesModule,
    PresupuestosModule,
    NotificacionesModule,
    PublicApiModule,
    UsuariosModule,
    ChatModule,
    ContenidoModule,
    CotizadorModule,
    ContactoWebModule,
    EnviosModule,
    UploadsModule,
    ConocimientoModule,
    CuentaModule,
    ReportesModule,
    CampanasModule,
    LandingsModule,
    ClientesTiendaModule,
    BoletinModule,
    InvitacionesModule,
    BlogModule,
    ProyectosModule,
    ClientesModule,
    PopupsModule,
    TicketsModule,
    RecursosModule,
  ],
  controllers: [HealthController],
  providers: [
    // Orden de ejecución de guards: JwtAuthGuard corre primero en todas las
    // rutas (salvo @Public()); MarcaRolGuard se aplica explícitamente por
    // módulo/ruta encima de este guard global.
    // Límite de peticiones por IP (global); @Limite(...) lo endurece en login/OTP y formularios públicos.
    { provide: APP_GUARD, useClass: LimitePeticionesGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
