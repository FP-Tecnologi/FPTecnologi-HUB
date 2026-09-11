import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSitioDto } from './dto/create-sitio.dto.js';

@Injectable()
export class SitiosService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSitioDto) {
    return this.prisma.sitio.create({ data: dto });
  }

  findAll(marcaId?: string) {
    return this.prisma.sitio.findMany({ where: marcaId ? { marcaId } : undefined });
  }

  async findByDominio(dominio: string) {
    const sitio = await this.prisma.sitio.findUnique({ where: { dominio }, include: { marca: true } });
    if (!sitio) {
      throw new NotFoundException('Sitio no encontrado');
    }
    return sitio;
  }

  async remove(id: string) {
    const sitio = await this.prisma.sitio.findUnique({ where: { id } });
    if (!sitio) {
      throw new NotFoundException('Sitio no encontrado');
    }
    return this.prisma.sitio.delete({ where: { id } });
  }
}
