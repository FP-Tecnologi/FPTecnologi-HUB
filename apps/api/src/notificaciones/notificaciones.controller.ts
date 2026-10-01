import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service.js';
import { CreateNotificacionDto } from './dto/create-notificacion.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  // Uso interno del backend (otros módulos) para crear notificaciones; se
  // deja también expuesto por HTTP para pruebas/administración manual.
  @Post()
  create(@Body() dto: CreateNotificacionDto) {
    return this.notificacionesService.create(dto);
  }

  @Get()
  findMine(@CurrentUser() user: AuthenticatedUser, @Query('tipo') tipo?: string, @Query('limite') limite?: string) {
    return this.notificacionesService.findAllDeUsuario(user.sub, tipo, Number(limite) || undefined);
  }

  @Patch(':id/leida')
  marcarLeida(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.notificacionesService.marcarLeida(user.sub, id);
  }

  @Patch('leidas/todas')
  marcarTodasLeidas(@CurrentUser() user: AuthenticatedUser) {
    return this.notificacionesService.marcarTodasLeidas(user.sub);
  }
}
