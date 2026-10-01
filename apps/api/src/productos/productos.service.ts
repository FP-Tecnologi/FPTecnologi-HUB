import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';

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
      where: { id, marcaId },
      data: { ...dto, ...(slug ? { slug } : {}) },
    });
  }

  async remove(marcaId: string, id: string) {
    await this.findOne(marcaId, id);
    return this.prisma.producto.delete({ where: { id, marcaId } });
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

  /** Categorías con su conteo de productos, para la pantalla de gestión del catálogo. */
  categoriasConConteo(marcaId: string) {
    return this.prisma.categoria.findMany({
      where: { marcaId },
      include: { _count: { select: { productos: true } } },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    });
  }

  async updateCategoria(marcaId: string, id: string, dto: UpdateCategoriaDto) {
    const actual = await this.prisma.categoria.findFirst({ where: { id, marcaId } });
    if (!actual) throw new NotFoundException('Categoría no encontrada');
    const data: Record<string, unknown> = { ...dto };
    if (dto.slug !== undefined && dto.slug !== actual.slug) {
      const choca = await this.prisma.categoria.findFirst({ where: { marcaId, slug: dto.slug, NOT: { id } } });
      if (choca) throw new ConflictException('Ya existe otra categoría con ese slug');
    }
    await this.prisma.categoria.updateMany({ where: { id, marcaId }, data });
    return this.prisma.categoria.findFirst({ where: { id, marcaId } });
  }

  /** Solo se borra una categoría vacía: no dejamos productos huérfanos sin que el admin lo decida. */
  async removeCategoria(marcaId: string, id: string) {
    const categoria = await this.prisma.categoria.findFirst({ where: { id, marcaId } });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');
    const productos = await this.prisma.producto.count({ where: { marcaId, categoriaId: id } });
    if (productos > 0) {
      throw new ConflictException(`La categoría tiene ${productos} producto(s): muévelos o desactívala en lugar de borrarla`);
    }
    await this.prisma.categoria.deleteMany({ where: { id, marcaId } });
    return { eliminada: true };
  }

  /** Marcas comerciales (fabricantes) en uso, con su conteo de productos. */
  async marcasComerciales(marcaId: string) {
    const filas = await this.prisma.producto.groupBy({
      by: ['marcaComercial'],
      where: { marcaId, marcaComercial: { not: null } },
      _count: { _all: true },
    });
    return filas
      .map((f) => ({ nombre: f.marcaComercial as string, productos: f._count._all }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  /** Renombra o fusiona: todos los productos de `desde` pasan a `hasta` (vacío = quitar la marca). */
  async renombrarMarcaComercial(marcaId: string, desde: string, hasta: string) {
    const { count } = await this.prisma.producto.updateMany({
      where: { marcaId, marcaComercial: desde },
      data: { marcaComercial: hasta.trim() || null },
    });
    if (!count) throw new NotFoundException('Esa marca no tiene productos');
    return { actualizados: count };
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
