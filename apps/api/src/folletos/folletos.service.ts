import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadsService, uploadsDir } from '../uploads/uploads.service.js';

const web = () => (process.env.WEB_PUBLICA_URL ?? 'https://fptecnologi.com').replace(/\/$/, '');
const EN_BASE = 'db';
const SIN_DATOS = { datos: true } as const; // los bytes del PDF viajan solo por su endpoint, no en cada listado
const slugDe = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'folleto';

@Injectable()
export class FolletosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploads: UploadsService,
  ) {}

  /** Los folletos nuevos guardan el PDF en la base (archivoUrl = 'db') y se sirven por /public/folletos/<enlace>/pdf; los antiguos, desde la carpeta de subidas. */
  private fila<T extends { marcaId: string; slug: string; archivoUrl: string }>(f: T) {
    const api = (process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 3001}`).replace(/\/$/, '');
    const pdf = f.archivoUrl === EN_BASE ? `${api}/public/folletos/${f.slug}/pdf?marcaId=${f.marcaId}` : f.archivoUrl.startsWith('/') ? `${api}${f.archivoUrl}` : f.archivoUrl;
    return { ...f, url: `${web()}/folleto/${f.slug}`, pdf };
  }

  async listar(marcaId: string) {
    return (await this.prisma.folleto.findMany({ where: { marcaId }, omit: SIN_DATOS, orderBy: { createdAt: 'desc' } })).map((f) => this.fila(f));
  }

  async crear(marcaId: string, titulo: string, archivo: { buffer: Buffer; size: number } | undefined, por: string) {
    const datos = await this.uploads.validarPdf(archivo);
    const f = await this.prisma.folleto.create({
      data: { marcaId, titulo: titulo.trim(), slug: `${slugDe(titulo)}-${randomBytes(3).toString('hex')}`, archivoUrl: EN_BASE, datos: new Uint8Array(datos), bytes: datos.length, creadoPor: por },
      omit: SIN_DATOS,
    });
    return this.fila(f);
  }

  async actualizar(marcaId: string, id: string, datos: { titulo?: string; activo?: boolean }) {
    const r = await this.prisma.folleto.updateMany({ where: { id, marcaId }, data: { ...(datos.titulo?.trim() ? { titulo: datos.titulo.trim() } : {}), ...(datos.activo === undefined ? {} : { activo: datos.activo }) } });
    if (r.count === 0) throw new NotFoundException('Folleto no encontrado');
    return { ok: true as const };
  }

  /** Cambia el PDF conservando el enlace (el que ya se compartió sigue funcionando y muestra el archivo nuevo). */
  async reemplazarPdf(marcaId: string, id: string, archivo: { buffer: Buffer; size: number } | undefined) {
    const f = await this.prisma.folleto.findFirst({ where: { id, marcaId }, omit: SIN_DATOS });
    if (!f) throw new NotFoundException('Folleto no encontrado');
    const datos = await this.uploads.validarPdf(archivo);
    await this.prisma.folleto.updateMany({ where: { id, marcaId }, data: { archivoUrl: EN_BASE, datos: new Uint8Array(datos), bytes: datos.length } });
    await this.borrarArchivo(marcaId, f.archivoUrl);
    return this.fila({ ...f, archivoUrl: EN_BASE, bytes: datos.length });
  }

  /** Genera un enlace nuevo y único; el anterior deja de funcionar (útil si se compartió por error). */
  async regenerarEnlace(marcaId: string, id: string) {
    const f = await this.prisma.folleto.findFirst({ where: { id, marcaId }, omit: SIN_DATOS });
    if (!f) throw new NotFoundException('Folleto no encontrado');
    const slug = `${slugDe(f.titulo)}-${randomBytes(3).toString('hex')}`;
    await this.prisma.folleto.updateMany({ where: { id, marcaId }, data: { slug } });
    return this.fila({ ...f, slug });
  }

  private async borrarArchivo(marcaId: string, archivoUrl: string) {
    if (new RegExp(`^/uploads/${marcaId}/catalogos/[0-9a-f-]{36}\\.pdf$`).test(archivoUrl)) {
      await unlink(join(uploadsDir(), archivoUrl.slice('/uploads/'.length))).catch(() => undefined);
    }
  }

  async eliminar(marcaId: string, id: string) {
    const f = await this.prisma.folleto.findFirst({ where: { id, marcaId }, omit: SIN_DATOS });
    if (!f) throw new NotFoundException('Folleto no encontrado');
    await this.prisma.folleto.deleteMany({ where: { id, marcaId } });
    await this.borrarArchivo(marcaId, f.archivoUrl);
    return { ok: true as const };
  }

  /** Dashboard: el PDF aunque el folleto esté inactivo (el endpoint público solo sirve los activos). */
  async pdfInterno(marcaId: string, id: string) {
    const f = await this.prisma.folleto.findFirst({ where: { id, marcaId }, select: { datos: true, titulo: true, archivoUrl: true } });
    if (!f) throw new NotFoundException('Folleto no encontrado');
    if (f.datos) return { titulo: f.titulo, datos: Buffer.from(f.datos) };
    if (new RegExp(`^/uploads/${marcaId}/catalogos/[0-9a-f-]{36}\\.pdf$`).test(f.archivoUrl)) {
      const datos = await readFile(join(uploadsDir(), f.archivoUrl.slice('/uploads/'.length))).catch(() => null);
      if (datos) return { titulo: f.titulo, datos };
    }
    throw new NotFoundException('El PDF de este folleto no está disponible');
  }

  /** Web pública: datos mínimos para el visor. Cuenta la visita sin frenar la respuesta. */
  async ver(marcaId: string, slug: string) {
    const f = await this.prisma.folleto.findFirst({ where: { marcaId, slug: slug.toLowerCase(), activo: true }, omit: SIN_DATOS });
    if (!f) throw new NotFoundException('Folleto no encontrado');
    void this.prisma.folleto.updateMany({ where: { id: f.id, marcaId }, data: { vistas: { increment: 1 } } }).catch(() => undefined);
    return { titulo: f.titulo, archivo: f.archivoUrl === EN_BASE ? `/folleto/${f.slug}/pdf` : f.archivoUrl };
  }

  /** El PDF guardado en la base (los antiguos salen de la carpeta de subidas y no pasan por aquí). */
  async pdf(marcaId: string, slug: string) {
    const f = await this.prisma.folleto.findFirst({ where: { marcaId, slug: slug.toLowerCase(), activo: true }, select: { datos: true, titulo: true } });
    if (!f?.datos) throw new NotFoundException('Folleto no encontrado');
    return { titulo: f.titulo, datos: Buffer.from(f.datos) };
  }
}
