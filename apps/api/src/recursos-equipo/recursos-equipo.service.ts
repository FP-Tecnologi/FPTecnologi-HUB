import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import { escanear } from '../uploads/antivirus.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import type { ActualizarRecursoEquipoDto, CrearRecursoEquipoDto } from './recursos-equipo.dto.js';
import { MAX_BYTES_EQUIPO, PREVISUALIZABLE, validarFormato } from './formatos.js';

/** «a, b ,, c» → ['a','b','c'] (máx. 10 etiquetas de 30 letras, sin repetir, en minúsculas). */
export const parsearEtiquetas = (txt?: string) =>
  [...new Set((txt ?? '').split(',').map((e) => e.trim().toLowerCase().slice(0, 30)).filter(Boolean))].slice(0, 10);

/** Campos que viajan en los listados (sin los bytes del archivo). */
const LISTADO = {
  id: true, titulo: true, descripcion: true, area: true, categoria: true, variante: true, marcaRef: true, etiquetas: true,
  nombreOriginal: true, ext: true, mime: true, bytes: true, descargas: true, subidoPorId: true, subidoPorNombre: true, createdAt: true, updatedAt: true,
} as const;

@Injectable()
export class RecursosEquipoService {
  constructor(private readonly prisma: PrismaService) {}

  /** ¿Es administrador? (super administrador o admin de alguna marca). */
  private async esGestor(user: AuthenticatedUser) {
    if (user.marcas.some((m) => m.rol === 'admin')) return true;
    const u = await this.prisma.usuario.findUnique({ where: { id: user.sub }, select: { superAdmin: true } });
    return !!u?.superAdmin;
  }

  private async marcaValida(marcaRef?: string) {
    const id = marcaRef?.trim();
    if (!id) return null;
    if (!(await this.prisma.marca.findUnique({ where: { id }, select: { id: true } }))) throw new BadRequestException('La marca indicada no existe');
    return id;
  }

  async listar(user: AuthenticatedUser) {
    const [filas, marcas, gestor] = await Promise.all([
      this.prisma.recursoEquipo.findMany({ orderBy: { createdAt: 'desc' }, take: 2000, select: LISTADO }),
      this.prisma.marca.findMany({ select: { id: true, nombre: true, logo: true }, orderBy: { nombre: 'asc' } }),
      this.esGestor(user),
    ]);
    const nombreMarca = new Map(marcas.map((m) => [m.id, m.nombre]));
    return {
      marcas,
      items: filas.map((f) => ({
        ...f,
        marcaNombre: f.marcaRef ? (nombreMarca.get(f.marcaRef) ?? null) : null,
        previsualizable: PREVISUALIZABLE.has(f.ext),
        puedeGestionar: gestor || f.subidoPorId === user.sub,
      })),
    };
  }

  async crear(user: AuthenticatedUser, dto: CrearRecursoEquipoDto, archivo?: { buffer: Buffer; size: number; originalname?: string }) {
    if (!archivo?.buffer?.length) throw new BadRequestException('Elige un archivo');
    if (archivo.size > MAX_BYTES_EQUIPO) throw new BadRequestException('El archivo pesa más de 25 MB. Comprímelo o comparte un enlace.');
    // Multer entrega el nombre en latin1: se recupera el UTF-8 (tildes, ñ).
    const nombreOriginal = Buffer.from(archivo.originalname ?? 'archivo', 'latin1').toString('utf8').replace(/[\\/<>:"|?*\u0000-\u001f]/g, '_').slice(0, 160);
    const { ext, mime } = validarFormato(nombreOriginal, archivo.buffer);
    await escanear(archivo.buffer);
    const marcaRef = await this.marcaValida(dto.marcaRef);
    const autor = await this.prisma.usuario.findUnique({ where: { id: user.sub }, select: { nombre: true, email: true } });
    return this.prisma.recursoEquipo.create({
      data: {
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion?.trim() || null,
        area: dto.area ?? 'GENERAL',
        categoria: dto.categoria ?? 'OTROS',
        variante: dto.variante?.trim() || null,
        marcaRef,
        etiquetas: parsearEtiquetas(dto.etiquetas),
        nombreOriginal,
        ext,
        mime,
        bytes: archivo.size,
        subidoPorId: user.sub,
        subidoPorNombre: autor?.nombre?.trim() || autor?.email || user.email,
        archivo: { create: { datos: new Uint8Array(archivo.buffer) } },
      },
      select: { id: true, titulo: true },
    });
  }

  async actualizar(user: AuthenticatedUser, id: string, dto: ActualizarRecursoEquipoDto) {
    await this.exigirPermiso(user, id, 'editarlo');
    const { marcaRef, etiquetas, descripcion, variante, ...resto } = dto;
    return this.prisma.recursoEquipo.update({
      where: { id },
      data: {
        ...resto,
        ...(descripcion !== undefined ? { descripcion: descripcion.trim() || null } : {}),
        ...(variante !== undefined ? { variante: variante.trim() || null } : {}),
        ...(marcaRef !== undefined ? { marcaRef: await this.marcaValida(marcaRef) } : {}),
        ...(etiquetas !== undefined ? { etiquetas: parsearEtiquetas(etiquetas) } : {}),
      },
      select: { id: true },
    });
  }

  async eliminar(user: AuthenticatedUser, id: string) {
    await this.exigirPermiso(user, id, 'borrarlo');
    await this.prisma.recursoEquipo.delete({ where: { id } }); // el archivo se borra en cascada
    return { ok: true as const };
  }

  /** Descarga (cuenta una descarga) o vista previa (`inline`, no cuenta). */
  async enviar(id: string, res: Response, inline: boolean) {
    const r = await this.prisma.recursoEquipo.findUnique({ where: { id }, include: { archivo: true } });
    if (!r?.archivo) throw new NotFoundException('Recurso no encontrado');
    const verEnLinea = inline && PREVISUALIZABLE.has(r.ext);
    if (!inline) await this.prisma.recursoEquipo.update({ where: { id }, data: { descargas: { increment: 1 } }, select: { id: true } });
    const datos = Buffer.from(r.archivo.datos);
    const nombre = r.nombreOriginal.replace(/[^\w. -]/g, '_');
    res.setHeader('Content-Type', r.mime);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; img-src data:; sandbox");
    res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
    res.setHeader('Content-Disposition', `${verEnLinea ? 'inline' : 'attachment'}; filename="${nombre}"; filename*=UTF-8''${encodeURIComponent(r.nombreOriginal)}`);
    res.setHeader('Content-Length', String(datos.length));
    res.end(datos);
  }

  /** Solo quien lo subió o un administrador puede editar o borrar. */
  private async exigirPermiso(user: AuthenticatedUser, id: string, accion: string) {
    const r = await this.prisma.recursoEquipo.findUnique({ where: { id }, select: { subidoPorId: true } });
    if (!r) throw new NotFoundException('Recurso no encontrado');
    if (r.subidoPorId !== user.sub && !(await this.esGestor(user))) throw new ForbiddenException(`Solo quien lo subió o un administrador puede ${accion}`);
  }
}
