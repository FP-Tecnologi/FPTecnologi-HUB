import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MAX_BYTES, normalizar, procesarDocumento, terminosDe } from './conocimiento.parser.js';

export interface Hallazgo { id: string; titulo: string; texto: string; origen: 'DOCUMENTO' | 'MANUAL' }

const MAX_TEXTO_HALLAZGO = 1200;
const MAX_PENDIENTES_ABIERTAS = 500;
const VENTANA_MS = 10 * 60_000;
const MAX_CONSULTAS = 120;
const consultas = new Map<string, number[]>();
const LOTE = 200;

@Injectable()
export class ConocimientoService {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------------------------------------------------------ documentos

  /** Lee el archivo UNA vez, lo trocea y guarda los fragmentos ya indexados (el original no se conserva). */
  async subir(marcaId: string, archivo: { buffer: Buffer; size: number; originalname: string } | undefined, email: string) {
    if (!archivo) throw new BadRequestException('Elige un archivo');
    if (archivo.size > MAX_BYTES) throw new BadRequestException('El archivo pesa más de 10 MB');
    // multer entrega el nombre en latin1: se corrige para conservar tildes y ñ.
    const nombre = Buffer.from(archivo.originalname, 'latin1').toString('utf8').slice(0, 150);
    const { tipo, fragmentos } = await procesarDocumento(archivo.buffer, nombre);
    const doc = await this.prisma.conocimientoDocumento.create({
      data: { marcaId, nombre, tipo, tamano: archivo.size, fragmentos: fragmentos.length, subidoPor: email },
    });
    for (let i = 0; i < fragmentos.length; i += LOTE) {
      await this.prisma.conocimientoFragmento.createMany({
        data: fragmentos.slice(i, i + LOTE).map((f, k) => ({
          marcaId, documentoId: doc.id, origen: 'DOCUMENTO' as const, titulo: f.titulo.slice(0, 200), texto: f.texto,
          indice: normalizar(`${f.titulo} ${f.texto}`), orden: i + k,
        })),
      });
    }
    return doc;
  }

  documentos(marcaId: string) {
    return this.prisma.conocimientoDocumento.findMany({ where: { marcaId }, orderBy: { createdAt: 'desc' }, take: 200 });
  }

  async fragmentosDe(marcaId: string, documentoId: string) {
    return this.prisma.conocimientoFragmento.findMany({
      where: { marcaId, documentoId }, orderBy: { orden: 'asc' }, take: 300, select: { id: true, titulo: true, texto: true, activo: true },
    });
  }

  async alternarDocumento(marcaId: string, id: string, activo: boolean) {
    const { count } = await this.prisma.conocimientoDocumento.updateMany({ where: { id, marcaId }, data: { activo } });
    if (!count) throw new NotFoundException('Documento no encontrado');
    await this.prisma.conocimientoFragmento.updateMany({ where: { marcaId, documentoId: id }, data: { activo } });
    return { activo };
  }

  async eliminarDocumento(marcaId: string, id: string) {
    await this.prisma.conocimientoFragmento.deleteMany({ where: { marcaId, documentoId: id } });
    const { count } = await this.prisma.conocimientoDocumento.deleteMany({ where: { id, marcaId } });
    if (!count) throw new NotFoundException('Documento no encontrado');
    return { eliminado: true };
  }

  // ------------------------------------------------------------------ respuestas oficiales (manual)

  respuestas(marcaId: string) {
    return this.prisma.conocimientoFragmento.findMany({
      where: { marcaId, origen: 'MANUAL' }, orderBy: { createdAt: 'desc' }, take: 500, select: { id: true, titulo: true, texto: true, activo: true, createdAt: true },
    });
  }

  async crearRespuesta(marcaId: string, pregunta: string, respuesta: string, pendienteId?: string) {
    const f = await this.prisma.conocimientoFragmento.create({
      data: { marcaId, origen: 'MANUAL', titulo: pregunta.trim(), texto: respuesta.trim(), indice: normalizar(`${pregunta} ${respuesta}`) },
      select: { id: true, titulo: true, texto: true, activo: true, createdAt: true },
    });
    if (pendienteId) await this.prisma.conocimientoPendiente.updateMany({ where: { id: pendienteId, marcaId }, data: { resuelta: true } });
    return f;
  }

  async actualizarRespuesta(marcaId: string, id: string, datos: { pregunta?: string; respuesta?: string; activo?: boolean }) {
    const actual = await this.prisma.conocimientoFragmento.findFirst({ where: { id, marcaId, origen: 'MANUAL' } });
    if (!actual) throw new NotFoundException('Respuesta no encontrada');
    const titulo = datos.pregunta?.trim() || actual.titulo;
    const texto = datos.respuesta?.trim() || actual.texto;
    await this.prisma.conocimientoFragmento.updateMany({
      where: { id, marcaId }, data: { titulo, texto, indice: normalizar(`${titulo} ${texto}`), ...(datos.activo !== undefined ? { activo: datos.activo } : {}) },
    });
    return { id, titulo, texto, activo: datos.activo ?? actual.activo };
  }

  async eliminarRespuesta(marcaId: string, id: string) {
    const { count } = await this.prisma.conocimientoFragmento.deleteMany({ where: { id, marcaId, origen: 'MANUAL' } });
    if (!count) throw new NotFoundException('Respuesta no encontrada');
    return { eliminada: true };
  }

  // ------------------------------------------------------------------ búsqueda

  /**
   * Fragmentos más relevantes a la pregunta, con la búsqueda de texto completo de Postgres (índice GIN): las
   * palabras de la pregunta (sin tildes ni palabras vacías) se unen con OR y se ordenan por relevancia; las
   * respuestas oficiales pesan 1.5×. Una sola consulta indexada, sin leer documentos.
   */
  async buscar(marcaId: string, pregunta: string, limite = 5): Promise<Hallazgo[]> {
    const terminos = terminosDe(pregunta);
    if (terminos.length === 0) return [];
    const q = terminos.join(' | ');
    const filas = await this.prisma.$queryRaw<Hallazgo[]>`
      SELECT id, titulo, texto, origen::text AS origen
      FROM "ConocimientoFragmento"
      WHERE "marcaId" = ${marcaId} AND activo = true AND busqueda @@ to_tsquery('spanish', ${q})
      ORDER BY ts_rank_cd(busqueda, to_tsquery('spanish', ${q})) * CASE WHEN origen = 'MANUAL' THEN 1.5 ELSE 1 END DESC
      LIMIT ${Math.min(Math.max(limite, 1), 8)}`;
    return filas.map((f) => ({ ...f, texto: f.texto.slice(0, MAX_TEXTO_HALLAZGO) }));
  }

  /** Lo que usa el chat de la web: fragmentos + instrucciones; si no hay nada, registra la pregunta como pendiente. */
  async consultar(marcaId: string, pregunta: string, ip: string) {
    this.limitar(`${marcaId}:${ip}`);
    const p = pregunta.trim().slice(0, 300);
    const [fragmentos, instrucciones] = await Promise.all([this.buscar(marcaId, p), this.instrucciones(marcaId)]);
    if (fragmentos.length === 0) await this.registrarPendiente(marcaId, p).catch(() => undefined);
    return { fragmentos, instrucciones: instrucciones.texto };
  }

  // ------------------------------------------------------------------ pendientes

  private async registrarPendiente(marcaId: string, pregunta: string) {
    const terminos = terminosDe(pregunta);
    if (terminos.length === 0 || pregunta.length < 8) return;
    const clave = [...terminos].sort().join(' ');
    const existente = await this.prisma.conocimientoPendiente.findFirst({ where: { marcaId, clave } });
    if (existente) {
      await this.prisma.conocimientoPendiente.updateMany({ where: { id: existente.id, marcaId }, data: { veces: { increment: 1 }, ultimaVez: new Date(), resuelta: false } });
      return;
    }
    const abiertas = await this.prisma.conocimientoPendiente.count({ where: { marcaId, resuelta: false } });
    if (abiertas >= MAX_PENDIENTES_ABIERTAS) return;
    await this.prisma.conocimientoPendiente.create({ data: { marcaId, pregunta, clave } });
  }

  pendientes(marcaId: string) {
    return this.prisma.conocimientoPendiente.findMany({ where: { marcaId, resuelta: false }, orderBy: [{ veces: 'desc' }, { ultimaVez: 'desc' }], take: 200 });
  }

  async resolverPendiente(marcaId: string, id: string) {
    const { count } = await this.prisma.conocimientoPendiente.updateMany({ where: { id, marcaId }, data: { resuelta: true } });
    if (!count) throw new NotFoundException('Pregunta no encontrada');
    return { resuelta: true };
  }

  // ------------------------------------------------------------------ instrucciones del asistente

  async instrucciones(marcaId: string) {
    const f = await this.prisma.contenidoWeb.findFirst({ where: { marcaId, pagina: 'asistente', seccion: 'instrucciones' } });
    const texto = (f?.datos as { texto?: unknown } | null)?.texto;
    return { texto: typeof texto === 'string' ? texto : '' };
  }

  async guardarInstrucciones(marcaId: string, texto: string, email: string) {
    const datos = { texto: texto.trim().slice(0, 3000) };
    const f = await this.prisma.contenidoWeb.findFirst({ where: { marcaId, pagina: 'asistente', seccion: 'instrucciones' } });
    if (f) await this.prisma.contenidoWeb.updateMany({ where: { id: f.id, marcaId }, data: { datos, actualizadoPor: email } });
    else await this.prisma.contenidoWeb.create({ data: { marcaId, pagina: 'asistente', seccion: 'instrucciones', datos, actualizadoPor: email } });
    return datos;
  }

  private limitar(clave: string) {
    const ahora = Date.now();
    const recientes = (consultas.get(clave) ?? []).filter((t) => ahora - t < VENTANA_MS);
    if (recientes.length >= MAX_CONSULTAS) throw new HttpException('Demasiadas consultas seguidas.', HttpStatus.TOO_MANY_REQUESTS);
    recientes.push(ahora);
    consultas.set(clave, recientes);
    if (consultas.size > 5000) for (const [k, v] of consultas) if (!v.some((t) => ahora - t < VENTANA_MS)) consultas.delete(k);
  }
}
