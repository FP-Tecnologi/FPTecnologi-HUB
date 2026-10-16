import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMarcaDto } from './dto/create-marca.dto.js';
import { UpdateMarcaDto } from './dto/update-marca.dto.js';

@Injectable()
export class MarcasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMarcaDto) {
    const marca = await this.prisma.marca.create({ data: dto });
    // Los super administradores quedan como admin de la marca nueva para poder gestionarla.
    const [supers, admin] = await Promise.all([
      this.prisma.usuario.findMany({ where: { superAdmin: true }, select: { id: true } }),
      this.prisma.rol.findUnique({ where: { nombre: 'admin' }, select: { id: true } }),
    ]);
    if (admin && supers.length) await this.prisma.usuarioMarcaRol.createMany({ data: supers.map((u) => ({ usuarioId: u.id, marcaId: marca.id, rolId: admin.id })), skipDuplicates: true });
    return marca;
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
