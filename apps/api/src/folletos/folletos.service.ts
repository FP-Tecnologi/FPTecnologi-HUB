import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadsService, uploadsDir } from '../uploads/uploads.service.js';

const web = () => (process.env.WEB_PUBLICA_URL ?? 'https://fptecnologi.com').replace(/\/$/, '');
const slugDe = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'folleto';

@Injectable()
export class FolletosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploads: UploadsService,
  ) {}

  private fila<T extends { slug: string; archivoUrl: string }>(f: T) {
    return { ...f, url: `${web()}/folleto/${f.slug}` };
  }

  async listar(marcaId: string) {
    return (await this.prisma.folleto.findMany({ where: { marcaId }, orderBy: { createdAt: 'desc' } })).map((f) => this.fila(f));
  }

  async crear(marcaId: string, titulo: string, archivo: { buffer: Buffer; size: number } | undefined, por: string) {
    const { ruta } = await this.uploads.guardarCatalogo(marcaId, archivo);
    const f = await this.prisma.folleto.create({
      data: { marcaId, titulo: titulo.trim(), slug: `${slugDe(titulo)}-${randomBytes(3).toString('hex')}`, archivoUrl: ruta, bytes: archivo?.size ?? 0, creadoPor: por },
    });
    return this.fila(f);
  }

  async actualizar(marcaId: string, id: string, datos: { titulo?: string; activo?: boolean }) {
    const r = await this.prisma.folleto.updateMany({ where: { id, marcaId }, data: { ...(datos.titulo?.trim() ? { titulo: datos.titulo.trim() } : {}), ...(datos.activo === undefined ? {} : { activo: datos.activo }) } });
    if (r.count === 0) throw new NotFoundException('Folleto no encontrado');
    return { ok: true as const };
  }

  async eliminar(marcaId: string, id: string) {
    const f = await this.prisma.folleto.findFirst({ where: { id, marcaId } });
    if (!f) throw new NotFoundException('Folleto no encontrado');
    await this.prisma.folleto.deleteMany({ where: { id, marcaId } });
    if (new RegExp(`^/uploads/${marcaId}/catalogos/[0-9a-f-]{36}\.pdf$`).test(f.archivoUrl)) {
      await unlink(join(uploadsDir(), f.archivoUrl.slice('/uploads/'.length))).catch(() => undefined);
    }
    return { ok: true as const };
  }

  /** Web pública: datos mínimos para el visor. Cuenta la visita sin frenar la respuesta. */
  async ver(marcaId: string, slug: string) {
    const f = await this.prisma.folleto.findFirst({ where: { marcaId, slug: slug.toLowerCase(), activo: true } });
    if (!f) throw new NotFoundException('Folleto no encontrado');
    void this.prisma.folleto.updateMany({ where: { id: f.id, marcaId }, data: { vistas: { increment: 1 } } }).catch(() => undefined);
    return { titulo: f.titulo, archivo: f.archivoUrl };
  }
}
