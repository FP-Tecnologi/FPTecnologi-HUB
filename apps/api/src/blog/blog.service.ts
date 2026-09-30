import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateArticuloDto, UpdateArticuloDto } from './blog.dto.js';

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

// Campos que ve la web en el listado (sin el contenido completo).
const RESUMEN = {
  id: true,
  titulo: true,
  slug: true,
  resumen: true,
  portadaUrl: true,
  categoria: true,
  etiquetas: true,
  autorNombre: true,
  destacado: true,
  publicadoEn: true,
} as const;

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------- dashboard

  list(marcaId: string) {
    return this.prisma.blogArticulo.findMany({
      where: { marcaId },
      orderBy: { updatedAt: 'desc' },
      select: { ...RESUMEN, estado: true, updatedAt: true, createdAt: true },
    });
  }

  async get(marcaId: string, id: string) {
    const a = await this.prisma.blogArticulo.findFirst({ where: { id, marcaId } });
    if (!a) throw new NotFoundException('Artículo no encontrado');
    return a;
  }

  async create(marcaId: string, dto: CreateArticuloDto, email: string) {
    const slug = await this.slugLibre(marcaId, dto.slug || slugify(dto.titulo));
    return this.prisma.blogArticulo.create({
      data: {
        ...dto,
        marcaId,
        slug,
        etiquetas: dto.etiquetas ?? [],
        creadoPor: email,
        publicadoEn: dto.estado === 'PUBLICADO' ? new Date() : null,
      },
    });
  }

  async update(marcaId: string, id: string, dto: UpdateArticuloDto) {
    const actual = await this.get(marcaId, id);
    const slug = dto.slug && dto.slug !== actual.slug ? await this.slugLibre(marcaId, dto.slug, id) : undefined;
    // Primera vez que se publica: guarda la fecha de publicación.
    const publicadoEn = dto.estado === 'PUBLICADO' && !actual.publicadoEn ? new Date() : undefined;
    return this.prisma.blogArticulo.update({
      where: { id, marcaId },
      data: { ...dto, ...(slug ? { slug } : {}), ...(publicadoEn ? { publicadoEn } : {}) },
    });
  }

  async remove(marcaId: string, id: string) {
    await this.get(marcaId, id);
    await this.prisma.blogArticulo.delete({ where: { id, marcaId } });
    return { success: true };
  }

  /** Si el slug ya existe en la marca, le agrega -2, -3... */
  private async slugLibre(marcaId: string, base: string, excluirId?: string) {
    const limpio = slugify(base);
    if (!limpio) throw new BadRequestException('El título no genera un slug válido');
    for (let n = 1; n < 50; n++) {
      const candidato = n === 1 ? limpio : `${limpio}-${n}`;
      const existe = await this.prisma.blogArticulo.findFirst({ where: { marcaId, slug: candidato }, select: { id: true } });
      if (!existe || existe.id === excluirId) return candidato;
    }
    throw new BadRequestException('No se pudo generar un slug único');
  }

  // ---------------------------------------------------------------- público

  publicados(marcaId: string) {
    return this.prisma.blogArticulo.findMany({
      where: { marcaId, estado: 'PUBLICADO' },
      orderBy: { publicadoEn: 'desc' },
      select: RESUMEN,
    });
  }

  async publicado(marcaId: string, slug: string) {
    const a = await this.prisma.blogArticulo.findFirst({
      where: { marcaId, slug, estado: 'PUBLICADO' },
      select: { ...RESUMEN, contenido: true },
    });
    if (!a) throw new NotFoundException('Artículo no encontrado');
    return a;
  }
}
