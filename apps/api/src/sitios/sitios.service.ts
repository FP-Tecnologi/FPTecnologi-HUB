import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSitioDto } from './dto/create-sitio.dto.js';

@Injectable()
export class SitiosService {
  constructor(private readonly prisma: PrismaService) {}

  create(marcaId: string, dto: CreateSitioDto) {
    return this.prisma.sitio.create({ data: { ...dto, marcaId } });
  }

  findAll(marcaId: string) {
    return this.prisma.sitio.findMany({ where: { marcaId }, orderBy: { dominio: 'asc' } });
  }

  async findByDominio(dominio: string) {
    const sitio = await this.prisma.sitio.findUnique({ where: { dominio }, include: { marca: true } });
    if (!sitio) {
      throw new NotFoundException('Sitio no encontrado');
    }
    return sitio;
  }

  async remove(marcaId: string, id: string) {
    const sitio = await this.prisma.sitio.findFirst({ where: { id, marcaId } });
    if (!sitio) {
      throw new NotFoundException('Sitio no encontrado');
    }
    return this.prisma.sitio.delete({ where: { id, marcaId } });
  }
}
