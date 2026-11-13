import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

const PAGINA = 50;
const MAX_CSV = 5000;

export interface EventoActividad {
  usuarioId?: string | null;
  email?: string | null;
  accion: string;
  detalle?: string;
  marcaId?: string | null;
  entidad?: string | null;
  entidadId?: string | null;
  metodo?: string | null;
  ruta?: string | null;
  ip?: string | null;
  dispositivo?: string | null;
  cambios?: unknown;
}

export interface FiltroActividad {
  q?: string;
  accion?: string;
  usuario?: string;
  marcaId?: string;
  desde?: string;
  hasta?: string;
  page?: number | string;
}

/** Registro de actividad (auditoría): quién hizo qué, cuándo y desde dónde. Nunca interrumpe la operación que lo origina. */
@Injectable()
export class ActividadService {
  private readonly logger = new Logger(ActividadService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registrar(e: EventoActividad): Promise<void> {
    try {
      await this.prisma.actividadLog.create({
        data: {
          usuarioId: e.usuarioId ?? null, email: e.email ?? null, accion: e.accion, detalle: e.detalle ?? null, marcaId: e.marcaId ?? null,
          entidad: e.entidad ?? null, entidadId: e.entidadId ?? null, metodo: e.metodo ?? null, ruta: e.ruta ?? null,
          ip: e.ip ?? null, dispositivo: e.dispositivo ?? null, cambios: (e.cambios ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (err) {
      this.logger.error(`No se pudo registrar la actividad ${e.accion}`, err as Error);
    }
  }

  private donde(f: FiltroActividad, marcaFija?: string): Prisma.ActividadLogWhereInput {
    const q = f.q?.trim();
    const usuario = f.usuario?.trim();
    const desde = f.desde ? new Date(`${f.desde}T00:00:00`) : null;
    const hasta = f.hasta ? new Date(`${f.hasta}T23:59:59.999`) : null;
    const rango: Prisma.DateTimeFilter = {};
    if (desde && !Number.isNaN(desde.getTime())) rango.gte = desde;
    if (hasta && !Number.isNaN(hasta.getTime())) rango.lte = hasta;
    const marca = marcaFija ?? f.marcaId;
    return {
      ...(f.accion ? { accion: f.accion } : {}),
      ...(marca ? { marcaId: marca } : {}),
      ...(usuario ? { email: { contains: usuario, mode: 'insensitive' as const } } : {}),
      ...(Object.keys(rango).length ? { createdAt: rango } : {}),
      ...(q ? { OR: [{ email: { contains: q, mode: 'insensitive' as const } }, { detalle: { contains: q, mode: 'insensitive' as const } }, { ruta: { contains: q, mode: 'insensitive' as const } }] } : {}),
    };
  }

  /** `marcaFija`: el admin de una marca solo ve la actividad de su marca; el super admin ve todo (y puede filtrar por marca). */
  async listar(f: FiltroActividad, marcaFija?: string) {
    const where = this.donde(f, marcaFija);
    const page = Math.max(1, Math.floor(Number(f.page) || 1));
    const [eventos, total, acciones, marcas] = await Promise.all([
      this.prisma.actividadLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGINA, take: PAGINA }),
      this.prisma.actividadLog.count({ where }),
      this.prisma.actividadLog.findMany({ where: marcaFija ? { marcaId: marcaFija } : {}, distinct: ['accion'], select: { accion: true }, orderBy: { accion: 'asc' } }),
      this.prisma.marca.findMany({ where: marcaFija ? { id: marcaFija } : {}, select: { id: true, nombre: true } }),
    ]);
    return { eventos, total, page, paginas: Math.max(1, Math.ceil(total / PAGINA)), porPagina: PAGINA, acciones: acciones.map((a) => a.accion), marcas };
  }

  /** CSV (UTF-8 con BOM para Excel) con los eventos que cumplen el filtro, hasta 5 000. */
  async exportar(f: FiltroActividad, marcaFija?: string) {
    const [filas, marcas] = await Promise.all([
      this.prisma.actividadLog.findMany({ where: this.donde(f, marcaFija), orderBy: { createdAt: 'desc' }, take: MAX_CSV }),
      this.prisma.marca.findMany({ select: { id: true, nombre: true } }),
    ]);
    const nombreMarca = (id: string | null) => (id ? marcas.find((m) => m.id === id)?.nombre ?? '' : '');
    const celda = (v: unknown) => {
      const t = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
      const seguro = /^[=+\-@]/.test(t) ? `'${t}` : t; // evita que Excel lo tome como fórmula
      return `"${seguro.replace(/"/g, '""')}"`;
    };
    const cab = ['Fecha', 'Usuario', 'Marca', 'Acción', 'Detalle', 'Método', 'Ruta', 'IP', 'Dispositivo', 'Datos enviados'];
    const lineas = filas.map((e) => [e.createdAt.toISOString(), e.email, nombreMarca(e.marcaId), e.accion, e.detalle, e.metodo, e.ruta, e.ip, e.dispositivo, e.cambios].map(celda).join(','));
    return { nombre: `actividad-${new Date().toISOString().slice(0, 10)}.csv`, csv: `﻿${[cab.map(celda).join(','), ...lineas].join('\r\n')}`, filas: filas.length };
  }
}
