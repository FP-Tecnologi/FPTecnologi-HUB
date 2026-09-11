import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto.js';

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(marcaId: string, dto: CreatePedidoDto) {
    const productoIds = dto.items.map((i) => i.productoId);
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: productoIds }, marcaId },
    });
    if (productos.length !== productoIds.length) {
      throw new BadRequestException('Uno o más productos no pertenecen a esta marca');
    }

    const productosPorId = new Map(productos.map((p) => [p.id, p]));
    let total = 0;
    const itemsData = dto.items.map((item) => {
      const producto = productosPorId.get(item.productoId)!;
      const precioUnitario = Number(producto.precio);
      total += precioUnitario * item.cantidad;
      return {
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario,
      };
    });

    return this.prisma.pedido.create({
      data: {
        marcaId,
        clienteId: dto.clienteId,
        total,
        items: { create: itemsData },
      },
      include: { items: true },
    });
  }

  findAll(marcaId: string) {
    return this.prisma.pedido.findMany({
      where: { marcaId },
      include: { items: { include: { producto: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(marcaId: string, id: string) {
    const pedido = await this.prisma.pedido.findFirst({
      where: { id, marcaId },
      include: { items: { include: { producto: true } } },
    });
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return pedido;
  }

  async updateEstado(marcaId: string, id: string, dto: UpdateEstadoPedidoDto) {
    await this.findOne(marcaId, id);
    return this.prisma.pedido.update({ where: { id }, data: { estado: dto.estado } });
  }
}
