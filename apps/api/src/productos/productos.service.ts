import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';

export type OrdenCatalogo = 'nuevos' | 'precio_asc' | 'precio_desc' | 'nombre_asc';

export type FiltrosCatalogo = {
  q?: string;
  categoriaId?: string;
  categoriaSlug?: string;
  marca?: string;
  minPrecio?: number;
  maxPrecio?: number;
  soloOfertas?: boolean;
  destacados?: boolean;
  orden?: OrdenCatalogo;
  page?: number;
  limit?: number;
};

/** minúsculas, sin tildes, espacios → guiones. Para URLs de tienda/categoría. */
export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

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
    const slug = await this.slugUnicoProducto(marcaId, dto.slug?.trim() || slugify(dto.nombre));
    return this.prisma.producto.create({ data: { ...dto, slug, marcaId } });
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

  /**
   * Catálogo público paginado para la tienda (fase ecommerce). Precios base
   * en USD sin IGV — el IGV se suma en el checkout, igual que en la web.
   */
  async buscarPublico(marcaId: string, filtros: FiltrosCatalogo = {}) {
    const page = Math.max(1, Math.floor(filtros.page ?? 1));
    const limit = Math.min(100, Math.max(1, Math.floor(filtros.limit ?? 24)));
    const where: Record<string, unknown> = { marcaId, activo: true };

    if (filtros.categoriaId) where.categoriaId = filtros.categoriaId;
    if (filtros.categoriaSlug) where.categoria = { marcaId, slug: filtros.categoriaSlug };
    if (filtros.marca) where.marcaComercial = { contains: filtros.marca, mode: 'insensitive' };
    if (filtros.minPrecio !== undefined || filtros.maxPrecio !== undefined) {
      where.precio = {
        ...(filtros.minPrecio !== undefined ? { gte: filtros.minPrecio } : {}),
        ...(filtros.maxPrecio !== undefined ? { lte: filtros.maxPrecio } : {}),
      };
    }
    if (filtros.soloOfertas) where.precioAntes = { not: null };
    if (filtros.destacados) where.destacado = true;
    if (filtros.q?.trim()) {
      const q = { contains: filtros.q.trim(), mode: 'insensitive' as const };
      where.OR = [{ nombre: q }, { descripcion: q }, { sku: q }, { marcaComercial: q }];
    }

    const orden = filtros.orden ?? 'nuevos';
    const orderBy =
      orden === 'precio_asc'
        ? { precio: 'asc' as const }
        : orden === 'precio_desc'
          ? { precio: 'desc' as const }
          : orden === 'nombre_asc'
            ? { nombre: 'asc' as const }
            : { createdAt: 'desc' as const };

    const [total, data] = await Promise.all([
      this.prisma.producto.count({ where }),
      this.prisma.producto.findMany({
        where,
        include: { categoria: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async findOne(marcaId: string, id: string, soloActivos = false) {
    const producto = await this.prisma.producto.findFirst({
      where: { id, marcaId, ...(soloActivos ? { activo: true } : {}) },
      include: { categoria: true },
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  async findBySlug(marcaId: string, slug: string, soloActivos = false) {
    const producto = await this.prisma.producto.findFirst({
      where: { slug, marcaId, ...(soloActivos ? { activo: true } : {}) },
      include: { categoria: true },
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  async update(marcaId: string, id: string, dto: UpdateProductoDto) {
    const actual = await this.findOne(marcaId, id);
    let slug = dto.slug?.trim();
    if (slug && slug !== actual.slug) {
      slug = await this.slugUnicoProducto(marcaId, slug, id);
    }
    return this.prisma.producto.update({
      where: { id },
      data: { ...dto, ...(slug ? { slug } : {}) },
    });
  }

  async remove(marcaId: string, id: string) {
    await this.findOne(marcaId, id);
    return this.prisma.producto.delete({ where: { id } });
  }

  async createCategoria(marcaId: string, dto: CreateCategoriaDto) {
    const slug = await this.slugUnicoCategoria(marcaId, dto.slug?.trim() || slugify(dto.nombre));
    return this.prisma.categoria.create({ data: { ...dto, slug, marcaId } });
  }

  findAllCategorias(marcaId: string, soloActivas = false) {
    return this.prisma.categoria.findMany({
      where: { marcaId, ...(soloActivas ? { activo: true } : {}) },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    });
  }

  async findCategoriaPorSlug(marcaId: string, slug: string) {
    const categoria = await this.prisma.categoria.findFirst({ where: { marcaId, slug } });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');
    return categoria;
  }

  private async slugUnicoProducto(marcaId: string, base: string, ignorarId?: string) {
    let slug = base || 'producto';
    let n = 2;
    for (;;) {
      const otro = await this.prisma.producto.findFirst({ where: { marcaId, slug } });
      if (!otro || otro.id === ignorarId) return slug;
      slug = `${base}-${n++}`;
    }
  }

  private async slugUnicoCategoria(marcaId: string, base: string) {
    let slug = base || 'categoria';
    let n = 2;
    for (;;) {
      const otra = await this.prisma.categoria.findFirst({ where: { marcaId, slug } });
      if (!otra) return slug;
      slug = `${base}-${n++}`;
    }
  }
}
