import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateNotificacionDto } from './dto/create-notificacion.dto.js';

@Injectable()
export class NotificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateNotificacionDto) {
    return this.prisma.notificacion.create({ data: dto });
  }

  findAllDeUsuario(usuarioId: string) {
    return this.prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async marcarLeida(usuarioId: string, id: string) {
    const notificacion = await this.prisma.notificacion.findFirst({ where: { id, usuarioId } });
    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }
    return this.prisma.notificacion.update({ where: { id }, data: { leida: true } });
  }

  async marcarTodasLeidas(usuarioId: string) {
    await this.prisma.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true },
    });
    return { success: true };
  }
}
