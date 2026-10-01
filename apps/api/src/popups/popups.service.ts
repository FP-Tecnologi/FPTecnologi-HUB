import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ActualizarPopupDto, CrearPopupDto } from './popups.dto.js';
import {
  type ContenidoPopup,
  faltaParaActivar,
  limpiarContenido,
  limpiarPaginas,
  plantillaPorId,
  situacion,
  vigente,
  type PlantillaPopup,
} from './popups.modelo.js';

const fecha = (s: string | null | undefined) => {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new BadRequestException('Fecha no válida');
  return d;
};

@Injectable()
export class PopupsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Listado del dashboard con la situación real (estado + fechas) y el producto vinculado. */
  async list(marcaId: string) {
    const popups = await this.prisma.popup.findMany({ where: { marcaId }, orderBy: [{ estado: 'asc' }, { prioridad: 'desc' }, { createdAt: 'desc' }] });
    const ids = [...new Set(popups.map((p) => p.productoId).filter((x): x is string => !!x))];
    const productos = ids.length ? await this.prisma.producto.findMany({ where: { marcaId, id: { in: ids } }, select: { id: true, nombre: true } }) : [];
    const nombre = new Map(productos.map((p) => [p.id, p.nombre]));
    return popups.map((p) => ({ ...p, situacion: situacion(p), productoNombre: p.productoId ? (nombre.get(p.productoId) ?? null) : null }));
  }

  crear(marcaId: string, dto: CrearPopupDto) {
    const def = plantillaPorId(dto.plantilla)!;
    return this.prisma.popup.create({
      data: {
        marcaId,
        nombre: dto.nombre.trim(),
        plantilla: dto.plantilla,
        formato: dto.formato ?? def.formato,
        contenido: { ...def.contenido },
        paginas: ['home'],
      },
    });
  }

  async actualizar(marcaId: string, id: string, dto: ActualizarPopupDto) {
    const actual = await this.obtener(marcaId, id);
    const data: Record<string, unknown> = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.formato !== undefined) data.formato = dto.formato;
    if (dto.estado !== undefined) data.estado = dto.estado;
    if (dto.contenido !== undefined) data.contenido = limpiarContenido(dto.contenido, actual.plantilla as PlantillaPopup);
    if (dto.prioridad !== undefined) data.prioridad = dto.prioridad;
    if (dto.disparador !== undefined) data.disparador = dto.disparador;
    if (dto.disparadorValor !== undefined) data.disparadorValor = dto.disparadorValor;
    if (dto.frecuencia !== undefined) data.frecuencia = dto.frecuencia;
    if (dto.frecuenciaValor !== undefined) data.frecuenciaValor = dto.frecuenciaValor;
    if (dto.paginas !== undefined) data.paginas = limpiarPaginas(dto.paginas);
    if (dto.dispositivo !== undefined) data.dispositivo = dto.dispositivo;
    if (dto.inicio !== undefined) data.inicio = fecha(dto.inicio);
    if (dto.fin !== undefined) data.fin = fecha(dto.fin);
    if (dto.productoId !== undefined) {
      if (dto.productoId) {
        const existe = await this.prisma.producto.findFirst({ where: { id: dto.productoId, marcaId }, select: { id: true } });
        if (!existe) throw new BadRequestException('Producto no encontrado');
      }
      data.productoId = dto.productoId || null;
    }

    const final = { ...actual, ...data } as typeof actual;
    const inicio = final.inicio, fin = final.fin;
    if (inicio && fin && fin <= inicio) throw new BadRequestException('La fecha de fin debe ser posterior al inicio');
    if (final.estado === 'ACTIVO') {
      const falta = faltaParaActivar({ plantilla: final.plantilla, contenido: final.contenido as unknown as ContenidoPopup, productoId: final.productoId, paginas: final.paginas });
      if (falta) throw new BadRequestException(falta);
    }

    await this.prisma.popup.updateMany({ where: { id, marcaId }, data });
    return this.obtener(marcaId, id);
  }

  /** Copia en borrador, sin estadísticas: sirve para armar variantes (p. ej. uno para home y otro para la tienda). */
  async duplicar(marcaId: string, id: string) {
    const o = await this.obtener(marcaId, id);
    return this.prisma.popup.create({
      data: {
        marcaId,
        nombre: `${o.nombre} (copia)`.slice(0, 100),
        plantilla: o.plantilla,
        formato: o.formato,
        contenido: o.contenido as object,
        productoId: o.productoId,
        prioridad: o.prioridad,
        disparador: o.disparador,
        disparadorValor: o.disparadorValor,
        frecuencia: o.frecuencia,
        frecuenciaValor: o.frecuenciaValor,
        paginas: o.paginas,
        dispositivo: o.dispositivo,
        inicio: o.inicio,
        fin: o.fin,
      },
    });
  }

  async eliminar(marcaId: string, id: string) {
    const { count } = await this.prisma.popup.deleteMany({ where: { id, marcaId } });
    if (!count) throw new NotFoundException('Popup no encontrado');
    return { eliminado: true };
  }

  /**
   * Popups que la web debe evaluar en una página: ACTIVOS, dentro de su ventana de fechas y que incluyan esa
   * página (o "todas"), por prioridad. Solo sale lo que la web necesita para pintarlos y decidir cuándo.
   * La frecuencia y el disparador los resuelve el navegador (necesita sesión/localStorage).
   */
  async publicos(marcaId: string, pagina: string) {
    const clave = pagina || 'otras';
    const ahora = new Date();
    const popups = await this.prisma.popup.findMany({
      where: { marcaId, estado: 'ACTIVO', paginas: { hasSome: [clave, 'todas'] } },
      orderBy: [{ prioridad: 'desc' }, { createdAt: 'desc' }],
    });
    const activos = popups.filter((p) => vigente(p, ahora)).slice(0, 5);
    const ids = [...new Set(activos.map((p) => p.productoId).filter((x): x is string => !!x))];
    const productos = ids.length
      ? await this.prisma.producto.findMany({ where: { marcaId, activo: true, id: { in: ids } }, select: { id: true, nombre: true, slug: true, precio: true, precioAntes: true, moneda: true, imagenes: true } })
      : [];
    const porId = new Map(productos.map((p) => [p.id, p]));

    return activos.flatMap((p) => {
      const contenido = p.contenido as unknown as ContenidoPopup;
      let producto: { nombre: string; imagen: string; precio: number; precioAntes: number | null; moneda: string } | null = null;
      let enlace = '';
      if (contenido.accion === 'producto' || p.plantilla === 'producto') {
        const prod = p.productoId ? porId.get(p.productoId) : undefined;
        if (!prod) return []; // producto dado de baja: mejor no mostrar nada que un popup roto
        producto = { nombre: prod.nombre, imagen: prod.imagenes[0] ?? '', precio: Number(prod.precio), precioAntes: prod.precioAntes == null ? null : Number(prod.precioAntes), moneda: prod.moneda };
        enlace = prod.slug ? `/producto/${prod.slug}` : '/tienda';
      } else if (contenido.accion === 'url') enlace = contenido.url;
      return [{
        id: p.id,
        plantilla: p.plantilla,
        formato: p.formato,
        contenido,
        producto,
        enlace,
        disparador: p.disparador,
        disparadorValor: p.disparadorValor,
        frecuencia: p.frecuencia,
        frecuenciaValor: p.frecuenciaValor,
        dispositivo: p.dispositivo,
        version: p.updatedAt.getTime(), // al editarlo, la web vuelve a mostrarlo aunque el visitante ya lo hubiera visto
      }];
    });
  }

  /** Cuenta una vista o un clic (solo de popups ACTIVOS de esa marca). */
  async registrarEvento(marcaId: string, id: string, tipo: 'vista' | 'clic') {
    await this.prisma.popup.updateMany({
      where: { id, marcaId, estado: 'ACTIVO' },
      data: tipo === 'vista' ? { vistas: { increment: 1 } } : { clics: { increment: 1 } },
    });
    return { ok: true };
  }

  private async obtener(marcaId: string, id: string) {
    const p = await this.prisma.popup.findFirst({ where: { id, marcaId } });
    if (!p) throw new NotFoundException('Popup no encontrado');
    return p;
  }
}
