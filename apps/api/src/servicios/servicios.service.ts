import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { slugify } from '../blog/blog.service.js';
import { CreateServicioDto } from './dto/create-servicio.dto.js';
import { UpdateServicioDto } from './dto/update-servicio.dto.js';

/** Los DTO anidados son clases; Prisma espera objetos planos para las columnas Json. */
function aDatos(dto: UpdateServicioDto) {
  const { beneficios, faqs, ...resto } = dto;
  return {
    ...resto,
    ...(beneficios ? { beneficios: beneficios.map((b) => ({ titulo: b.titulo, texto: b.texto })) } : {}),
    ...(faqs ? { faqs: faqs.map((f) => ({ p: f.p, r: f.r })) } : {}),
  };
}

@Injectable()
export class ServiciosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(marcaId: string, dto: CreateServicioDto) {
    const slug = await this.slugLibre(marcaId, dto.slug || dto.nombre);
    return this.prisma.servicio.create({ data: { ...aDatos(dto), nombre: dto.nombre, slug, marcaId } });
  }

  findAll(marcaId: string, soloActivos = false) {
    return this.prisma.servicio.findMany({
      where: { marcaId, ...(soloActivos ? { activo: true } : {}) },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    });
  }

  /** Por id o, para la web pública, por slug. */
  async findOne(marcaId: string, idOrSlug: string, soloActivos = false) {
    const servicio = await this.prisma.servicio.findFirst({
      where: { marcaId, OR: [{ id: idOrSlug }, { slug: idOrSlug }], ...(soloActivos ? { activo: true } : {}) },
    });
    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return servicio;
  }

  async update(marcaId: string, id: string, dto: UpdateServicioDto) {
    const actual = await this.findOne(marcaId, id);
    const slug = dto.slug && dto.slug !== actual.slug ? await this.slugLibre(marcaId, dto.slug, actual.id) : undefined;
    return this.prisma.servicio.update({
      where: { id: actual.id, marcaId },
      data: { ...aDatos(dto), ...(slug ? { slug } : {}) },
    });
  }

  async remove(marcaId: string, id: string) {
    const actual = await this.findOne(marcaId, id);
    return this.prisma.servicio.delete({ where: { id: actual.id, marcaId } });
  }

  /** Si el slug ya existe en la marca, le agrega -2, -3... */
  private async slugLibre(marcaId: string, base: string, excluirId?: string) {
    const limpio = slugify(base);
    if (!limpio) throw new BadRequestException('El nombre no genera un slug válido');
    for (let n = 1; n < 50; n++) {
      const candidato = n === 1 ? limpio : `${limpio}-${n}`;
      const existe = await this.prisma.servicio.findFirst({ where: { marcaId, slug: candidato }, select: { id: true } });
      if (!existe || existe.id === excluirId) return candidato;
    }
    throw new BadRequestException('No se pudo generar un slug único');
  }
}
