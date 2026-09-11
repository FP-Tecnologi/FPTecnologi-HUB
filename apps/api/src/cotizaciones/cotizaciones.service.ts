import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto.js';
import { UpdateEstadoCotizacionDto } from './dto/update-estado-cotizacion.dto.js';

@Injectable()
export class CotizacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(marcaId: string, dto: CreateCotizacionDto) {
    const servicio = await this.prisma.servicio.findFirst({
      where: { id: dto.servicioId, marcaId, activo: true },
    });
    if (!servicio) {
      throw new BadRequestException('El servicio no existe o no pertenece a esta marca');
    }
    return this.prisma.cotizacion.create({ data: { ...dto, marcaId } });
  }

  findAll(marcaId: string) {
    return this.prisma.cotizacion.findMany({
      where: { marcaId },
      include: { servicio: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(marcaId: string, id: string) {
    const cotizacion = await this.prisma.cotizacion.findFirst({
      where: { id, marcaId },
      include: { servicio: true },
    });
    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }
    return cotizacion;
  }

  async updateEstado(marcaId: string, id: string, dto: UpdateEstadoCotizacionDto) {
    await this.findOne(marcaId, id);
    return this.prisma.cotizacion.update({ where: { id }, data: { estado: dto.estado } });
  }
}
