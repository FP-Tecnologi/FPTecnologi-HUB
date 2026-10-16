import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const MAX = 300;

export interface EventoActividad {
  usuarioId?: string | null;
  email?: string | null;
  accion: string;
  detalle?: string;
  marcaId?: string | null;
}

/** Registro de actividad (auditoría): quién hizo qué y cuándo. Nunca interrumpe la operación que lo origina. */
@Injectable()
export class ActividadService {
  private readonly logger = new Logger(ActividadService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registrar(e: EventoActividad): Promise<void> {
    try {
      await this.prisma.actividadLog.create({
        data: { usuarioId: e.usuarioId ?? null, email: e.email ?? null, accion: e.accion, detalle: e.detalle ?? null, marcaId: e.marcaId ?? null },
      });
    } catch (err) {
      this.logger.error(`No se pudo registrar la actividad ${e.accion}`, err as Error);
    }
  }

  async listar(f: { q?: string; accion?: string }) {
    const q = f.q?.trim();
    const [eventos, acciones, marcas] = await Promise.all([
      this.prisma.actividadLog.findMany({
        where: {
          ...(f.accion ? { accion: f.accion } : {}),
          ...(q ? { OR: [{ email: { contains: q, mode: 'insensitive' as const } }, { detalle: { contains: q, mode: 'insensitive' as const } }] } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: MAX,
      }),
      this.prisma.actividadLog.findMany({ distinct: ['accion'], select: { accion: true }, orderBy: { accion: 'asc' } }),
      this.prisma.marca.findMany({ select: { id: true, nombre: true } }),
    ]);
    return { eventos, acciones: acciones.map((a) => a.accion), marcas };
  }
}
