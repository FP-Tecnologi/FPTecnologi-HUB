import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateProyectoDto, UpdateProyectoDto } from './proyectos.dto.js';

@Injectable()
export class ProyectosService {
  constructor(private readonly prisma: PrismaService) {}

  list(marcaId: string, soloActivos = false) {
    return this.prisma.proyecto.findMany({
      where: { marcaId, ...(soloActivos ? { activo: true } : {}) },
      orderBy: [{ orden: 'asc' }, { anio: 'desc' }, { titulo: 'asc' }],
    });
  }

  create(marcaId: string, dto: CreateProyectoDto) {
    return this.prisma.proyecto.create({ data: { ...dto, marcaId } });
  }

  async update(marcaId: string, id: string, dto: UpdateProyectoDto) {
    await this.get(marcaId, id);
    return this.prisma.proyecto.update({ where: { id, marcaId }, data: dto });
  }

  async remove(marcaId: string, id: string) {
    await this.get(marcaId, id);
    return this.prisma.proyecto.delete({ where: { id, marcaId } });
  }

  private async get(marcaId: string, id: string) {
    const p = await this.prisma.proyecto.findFirst({ where: { id, marcaId } });
    if (!p) throw new NotFoundException('Proyecto no encontrado');
    return p;
  }
}
