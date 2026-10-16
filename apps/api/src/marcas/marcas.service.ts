import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMarcaDto } from './dto/create-marca.dto.js';
import { UpdateMarcaDto } from './dto/update-marca.dto.js';

@Injectable()
export class MarcasService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateMarcaDto) {
    return this.prisma.marca.create({ data: dto });
  }

  findAll() {
    return this.prisma.marca.findMany({ orderBy: { nombre: 'asc' } });
  }

  /** Marcas con sus dominios y cuántos usuarios y tickets tienen (para la pantalla de gestión). */
  async resumen() {
    const marcas = await this.prisma.marca.findMany({
      orderBy: { nombre: 'asc' },
      include: { sitios: { select: { id: true, dominio: true } }, _count: { select: { usuarios: true, productos: true, soporteTickets: true } } },
    });
    return marcas;
  }

  async findOne(id: string) {
    const marca = await this.prisma.marca.findUnique({ where: { id } });
    if (!marca) {
      throw new NotFoundException('Marca no encontrada');
    }
    return marca;
  }

  async update(id: string, dto: UpdateMarcaDto) {
    await this.findOne(id);
    return this.prisma.marca.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.marca.delete({ where: { id } });
  }
}
