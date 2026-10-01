import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateClienteDto, UpdateClienteDto } from './clientes.dto.js';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  list(marcaId: string, soloActivos = false) {
    return this.prisma.cliente.findMany({
      where: { marcaId, ...(soloActivos ? { activo: true } : {}) },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    });
  }

  create(marcaId: string, dto: CreateClienteDto) {
    return this.prisma.cliente.create({ data: { ...dto, marcaId } });
  }

  async update(marcaId: string, id: string, dto: UpdateClienteDto) {
    await this.get(marcaId, id);
    return this.prisma.cliente.update({ where: { id, marcaId }, data: dto });
  }

  async remove(marcaId: string, id: string) {
    await this.get(marcaId, id);
    return this.prisma.cliente.delete({ where: { id, marcaId } });
  }

  private async get(marcaId: string, id: string) {
    const p = await this.prisma.cliente.findFirst({ where: { id, marcaId } });
    if (!p) throw new NotFoundException('Cliente no encontrado');
    return p;
  }
}
