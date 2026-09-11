import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';

/**
 * Todas las consultas reciben `marcaId` explícitamente y lo aplican en el
 * `where` de Prisma. El controlador SIEMPRE obtiene ese marcaId de
 * MarcaActual (header/token verificado por MarcaRolGuard), nunca del body
 * que manda el cliente — así ningún endpoint puede filtrar o modificar
 * productos de otra marca.
 */
@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(marcaId: string, dto: CreateProductoDto) {
    const existente = await this.prisma.producto.findUnique({
      where: { marcaId_sku: { marcaId, sku: dto.sku } },
    });
    if (existente) {
      throw new ConflictException('Ya existe un producto con ese SKU para esta marca');
    }
    return this.prisma.producto.create({ data: { ...dto, marcaId } });
  }

  findAll(marcaId: string, categoriaId?: string, soloActivos = false) {
    return this.prisma.producto.findMany({
      where: {
        marcaId,
        ...(categoriaId ? { categoriaId } : {}),
        ...(soloActivos ? { activo: true } : {}),
      },
      include: { categoria: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(marcaId: string, id: string, soloActivos = false) {
    const producto = await this.prisma.producto.findFirst({
      where: { id, marcaId, ...(soloActivos ? { activo: true } : {}) },
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  async update(marcaId: string, id: string, dto: UpdateProductoDto) {
    await this.findOne(marcaId, id);
    return this.prisma.producto.update({ where: { id }, data: dto });
  }

  async remove(marcaId: string, id: string) {
    await this.findOne(marcaId, id);
    return this.prisma.producto.delete({ where: { id } });
  }

  createCategoria(marcaId: string, dto: CreateCategoriaDto) {
    return this.prisma.categoria.create({ data: { ...dto, marcaId } });
  }

  findAllCategorias(marcaId: string) {
    return this.prisma.categoria.findMany({ where: { marcaId }, orderBy: { nombre: 'asc' } });
  }
}
