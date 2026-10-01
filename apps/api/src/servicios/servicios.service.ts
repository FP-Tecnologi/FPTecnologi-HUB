import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateServicioDto } from './dto/create-servicio.dto.js';
import { UpdateServicioDto } from './dto/update-servicio.dto.js';

@Injectable()
export class ServiciosService {
  constructor(private readonly prisma: PrismaService) {}

  create(marcaId: string, dto: CreateServicioDto) {
    return this.prisma.servicio.create({ data: { ...dto, marcaId } });
  }

  findAll(marcaId: string, soloActivos = false) {
    return this.prisma.servicio.findMany({
      where: { marcaId, ...(soloActivos ? { activo: true } : {}) },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(marcaId: string, id: string, soloActivos = false) {
    const servicio = await this.prisma.servicio.findFirst({
      where: { id, marcaId, ...(soloActivos ? { activo: true } : {}) },
    });
    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return servicio;
  }

  async update(marcaId: string, id: string, dto: UpdateServicioDto) {
    await this.findOne(marcaId, id);
    return this.prisma.servicio.update({ where: { id, marcaId }, data: dto });
  }

  async remove(marcaId: string, id: string) {
    await this.findOne(marcaId, id);
    return this.prisma.servicio.delete({ where: { id, marcaId } });
  }
}
