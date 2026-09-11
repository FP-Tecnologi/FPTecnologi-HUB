import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
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
    NotificacionesModule,
    PublicApiModule,
  ],
  controllers: [HealthController],
  providers: [
    // Orden de ejecución de guards: JwtAuthGuard corre primero en todas las
    // rutas (salvo @Public()); MarcaRolGuard se aplica explícitamente por
    // módulo/ruta encima de este guard global.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
