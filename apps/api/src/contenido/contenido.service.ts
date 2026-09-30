import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class ContenidoService {
  constructor(private readonly prisma: PrismaService) {}

  /** { seccion: datos, ... } de una página. Lo que no esté guardado usa los defaults de la web. */
  async pagina(marcaId: string, pagina: string) {
    const rows = await this.prisma.contenidoWeb.findMany({ where: { marcaId, pagina } });
    return Object.fromEntries(rows.map((r) => [r.seccion, r.datos]));
  }

  // upsert "a mano": el tenant-guard no cubre upsert (ver tenant-guard.extension.ts).
  async guardar(marcaId: string, pagina: string, seccion: string, datos: Record<string, unknown>, email: string) {
    const json = datos as Prisma.InputJsonValue;
    const actual = await this.prisma.contenidoWeb.findFirst({ where: { marcaId, pagina, seccion } });
    const row = actual
      ? await this.prisma.contenidoWeb.update({ where: { id: actual.id, marcaId }, data: { datos: json, actualizadoPor: email } })
      : await this.prisma.contenidoWeb.create({ data: { marcaId, pagina, seccion, datos: json, actualizadoPor: email } });
    return { seccion: row.seccion, datos: row.datos, updatedAt: row.updatedAt, actualizadoPor: row.actualizadoPor };
  }
}
