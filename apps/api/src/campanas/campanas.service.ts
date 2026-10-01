import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ActualizarCampanaDto, CrearCampanaDto } from './campanas.dto.js';

const fecha = (s?: string) => {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new BadRequestException('Fecha no válida');
  return d;
};

@Injectable()
export class CampanasService {
  constructor(private readonly prisma: PrismaService) {}

  /** Campañas con sus landings y el total de registros captados. */
  async list(marcaId: string) {
    const campanas = await this.prisma.campana.findMany({
      where: { marcaId },
      include: { landings: { select: { id: true, nombre: true, slug: true, estado: true, _count: { select: { registros: true } } } } },
      orderBy: [{ estado: 'asc' }, { createdAt: 'desc' }],
    });
    return campanas.map(({ landings, ...c }) => ({
      ...c,
      landings: landings.map((l) => ({ id: l.id, nombre: l.nombre, slug: l.slug, estado: l.estado, registros: l._count.registros })),
      registros: landings.reduce((s, l) => s + l._count.registros, 0),
    }));
  }

  crear(marcaId: string, dto: CrearCampanaDto) {
    return this.prisma.campana.create({
      data: {
        marcaId,
        nombre: dto.nombre.trim(),
        descripcion: dto.descripcion?.trim() || null,
        objetivo: dto.objetivo?.trim() || null,
        estado: dto.estado ?? 'BORRADOR',
        inicio: fecha(dto.inicio),
        fin: fecha(dto.fin),
        presupuesto: dto.presupuesto ?? null,
        moneda: dto.moneda ?? 'PEN',
      },
    });
  }

  async actualizar(marcaId: string, id: string, dto: ActualizarCampanaDto) {
    const data: Record<string, unknown> = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion.trim() || null;
    if (dto.objetivo !== undefined) data.objetivo = dto.objetivo.trim() || null;
    if (dto.estado !== undefined) data.estado = dto.estado;
    if (dto.inicio !== undefined) data.inicio = fecha(dto.inicio);
    if (dto.fin !== undefined) data.fin = fecha(dto.fin);
    if (dto.presupuesto !== undefined) data.presupuesto = dto.presupuesto;
    if (dto.moneda !== undefined) data.moneda = dto.moneda;
    const { count } = await this.prisma.campana.updateMany({ where: { id, marcaId }, data });
    if (!count) throw new NotFoundException('Campaña no encontrada');
    return this.prisma.campana.findFirst({ where: { id, marcaId } });
  }

  /** Borrar una campaña no borra sus landings: quedan sin campaña (onDelete SetNull). */
  async eliminar(marcaId: string, id: string) {
    const { count } = await this.prisma.campana.deleteMany({ where: { id, marcaId } });
    if (!count) throw new NotFoundException('Campaña no encontrada');
    return { eliminada: true };
  }
}
