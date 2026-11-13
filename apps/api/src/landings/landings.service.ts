import { BadRequestException, ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { ActividadService } from '../actividad/actividad.service.js';
import { ActualizarLandingDto, CrearLandingDto, RegistroPublicoDto } from './landings.dto.js';
import {
  type Contenido,
  type Formulario,
  limpiarContenido,
  limpiarFormulario,
  plantillaPorId,
  resumenContacto,
  validarRegistro,
} from './landings.modelo.js';

// Roles que reciben el aviso de registro nuevo en una landing.
const ROLES_AVISO = ['admin', 'marketing'];
// Roles que revisan y aprueban las landings que envía un comercial.
const ROLES_REVISAN = ['admin', 'jefe_comercial'];
export interface Actor { id: string; email: string; rol: string }
const VENTANA_MS = 10 * 60_000;
const MAX_POR_VENTANA = 8;
const intentos = new Map<string, number[]>();
const PREVIEW_MIN = 20;

const slugDe = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'landing';

@Injectable()
export class LandingsService {
  private readonly logger = new Logger(LandingsService.name);

  constructor(private readonly prisma: PrismaService, private readonly actividad: ActividadService) {}

  // ---------------------------------------------------------------- dashboard

  list(marcaId: string) {
    return this.prisma.landing.findMany({
      where: { marcaId },
      select: {
        id: true, slug: true, nombre: true, plantilla: true, estado: true, campanaId: true, createdAt: true, updatedAt: true, creadoPorId: true, comentarioRevision: true,
        campana: { select: { id: true, nombre: true } },
        _count: { select: { registros: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async get(marcaId: string, id: string) {
    const l = await this.prisma.landing.findFirst({ where: { id, marcaId }, include: { campana: { select: { id: true, nombre: true } }, _count: { select: { registros: true } } } });
    if (!l) throw new NotFoundException('Landing no encontrada');
    return l;
  }

  async crear(marcaId: string, dto: CrearLandingDto, actor: Actor) {
    const plantilla = plantillaPorId(dto.plantilla)!;
    if (dto.campanaId) await this.campanaValida(marcaId, dto.campanaId);
    const slug = await this.slugLibre(marcaId, dto.slug ?? slugDe(dto.nombre));
    return this.prisma.landing.create({
      data: {
        marcaId, slug, nombre: dto.nombre.trim(), plantilla: plantilla.id, campanaId: dto.campanaId ?? null, creadoPorId: actor.id,
        contenido: plantilla.contenido as never, formulario: plantilla.formulario as never,
      },
    });
  }

  async actualizar(marcaId: string, id: string, dto: ActualizarLandingDto, actor: Actor) {
    const actual = await this.get(marcaId, id);
    const esComercial = actor.rol === 'comercial';
    if (esComercial) {
      // Un comercial no publica: trabaja sus borradores y los envía a revisión.
      if (actual.creadoPorId !== actor.id) throw new ForbiddenException('Solo puedes editar las landings que creaste');
      if (actual.estado === 'EN_REVISION') throw new ConflictException('Está en revisión: espera la respuesta del jefe comercial');
      if (actual.estado === 'PUBLICADA') throw new ConflictException('Ya está publicada: pide al jefe comercial que la despublique para editarla');
    }
    const data: Record<string, unknown> = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.estado !== undefined && !esComercial) {
      data.estado = dto.estado;
      if (dto.estado === 'PUBLICADA') { data.revisadoPorId = actor.id; data.revisadoAt = new Date(); data.comentarioRevision = null; }
    }
    if (dto.campanaId !== undefined) {
      if (dto.campanaId) await this.campanaValida(marcaId, dto.campanaId);
      data.campanaId = dto.campanaId;
    }
    if (dto.slug !== undefined && dto.slug !== actual.slug) {
      const choca = await this.prisma.landing.findFirst({ where: { marcaId, slug: dto.slug, NOT: { id } } });
      if (choca) throw new ConflictException('Ya existe otra landing con esa URL');
      data.slug = dto.slug;
    }
    if (dto.contenido !== undefined) data.contenido = limpiarContenido(dto.contenido, actual.contenido as unknown as Contenido) as never;
    if (dto.formulario !== undefined) {
      try { data.formulario = limpiarFormulario(dto.formulario) as never; } catch (e) { throw new BadRequestException((e as Error).message); }
    }
    await this.prisma.landing.updateMany({ where: { id, marcaId }, data });
    return this.get(marcaId, id);
  }

  async duplicar(marcaId: string, id: string, actor: Actor) {
    const l = await this.get(marcaId, id);
    const slug = await this.slugLibre(marcaId, `${l.slug}-copia`);
    return this.prisma.landing.create({
      data: { marcaId, slug, nombre: `${l.nombre} (copia)`, plantilla: l.plantilla, campanaId: l.campanaId, creadoPorId: actor.id, contenido: l.contenido as never, formulario: l.formulario as never },
    });
  }

  async eliminar(marcaId: string, id: string) {
    await this.get(marcaId, id);
    await this.prisma.landingRegistro.deleteMany({ where: { marcaId, landingId: id } });
    await this.prisma.landing.deleteMany({ where: { id, marcaId } });
    return { eliminada: true };
  }

  // ------------------------------------------------------------------ revisión

  /** El comercial (o quien la creó) manda su borrador al jefe comercial. */
  async enviarRevision(marcaId: string, id: string, actor: Actor) {
    const l = await this.get(marcaId, id);
    if (actor.rol === 'comercial' && l.creadoPorId !== actor.id) throw new ForbiddenException('Solo puedes enviar las landings que creaste');
    if (l.estado !== 'BORRADOR') throw new ConflictException(l.estado === 'EN_REVISION' ? 'Ya está en revisión' : 'Ya está publicada');
    await this.prisma.landing.updateMany({ where: { id, marcaId }, data: { estado: 'EN_REVISION', enviadaRevisionAt: new Date(), comentarioRevision: null } });
    await this.notificar(marcaId, ROLES_REVISAN, 'Landing por revisar', `${actor.email} envió “${l.nombre}” a revisión`, actor.id);
    void this.actividad.registrar({ usuarioId: actor.id, email: actor.email, accion: 'landing_enviada_revision', detalle: l.nombre, marcaId });
    return this.get(marcaId, id);
  }

  /** Landings esperando respuesta, con quién las envió. */
  async pendientes(marcaId: string) {
    const filas = await this.prisma.landing.findMany({
      where: { marcaId, estado: 'EN_REVISION' },
      select: { id: true, slug: true, nombre: true, plantilla: true, creadoPorId: true, enviadaRevisionAt: true, updatedAt: true, campana: { select: { id: true, nombre: true } } },
      orderBy: { enviadaRevisionAt: 'asc' },
    });
    const ids = [...new Set(filas.map((f) => f.creadoPorId).filter((x): x is string => !!x))];
    const usuarios = ids.length ? await this.prisma.usuario.findMany({ where: { id: { in: ids } }, select: { id: true, nombre: true, email: true } }) : [];
    return filas.map((f) => ({ ...f, creador: usuarios.find((u) => u.id === f.creadoPorId) ?? null }));
  }

  /** Aprobar = publicar. Avisa a quien la creó. */
  async aprobar(marcaId: string, id: string, actor: Actor) {
    const l = await this.get(marcaId, id);
    if (l.estado !== 'EN_REVISION') throw new ConflictException('Esta landing no está en revisión');
    await this.prisma.landing.updateMany({ where: { id, marcaId }, data: { estado: 'PUBLICADA', revisadoPorId: actor.id, revisadoAt: new Date(), comentarioRevision: null } });
    if (l.creadoPorId) await this.avisarUsuario(marcaId, l.creadoPorId, 'Tu landing fue aprobada', `“${l.nombre}” ya está publicada`);
    void this.actividad.registrar({ usuarioId: actor.id, email: actor.email, accion: 'landing_aprobada', detalle: l.nombre, marcaId });
    return this.get(marcaId, id);
  }

  /** Devolver al borrador con el motivo, para que el comercial la corrija. */
  async rechazar(marcaId: string, id: string, comentario: string, actor: Actor) {
    const l = await this.get(marcaId, id);
    if (l.estado !== 'EN_REVISION') throw new ConflictException('Esta landing no está en revisión');
    const motivo = comentario.trim();
    await this.prisma.landing.updateMany({ where: { id, marcaId }, data: { estado: 'BORRADOR', revisadoPorId: actor.id, revisadoAt: new Date(), comentarioRevision: motivo } });
    if (l.creadoPorId) await this.avisarUsuario(marcaId, l.creadoPorId, 'Tu landing necesita cambios', `“${l.nombre}”: ${motivo}`);
    void this.actividad.registrar({ usuarioId: actor.id, email: actor.email, accion: 'landing_devuelta', detalle: `${l.nombre} · ${motivo}`.slice(0, 280), marcaId });
    return this.get(marcaId, id);
  }

  async registros(marcaId: string, id: string) {
    await this.get(marcaId, id);
    return this.prisma.landingRegistro.findMany({ where: { marcaId, landingId: id }, orderBy: { createdAt: 'desc' }, take: 5000 });
  }

  async eliminarRegistro(marcaId: string, id: string, registroId: string) {
    const { count } = await this.prisma.landingRegistro.deleteMany({ where: { id: registroId, marcaId, landingId: id } });
    if (!count) throw new NotFoundException('Registro no encontrado');
    return { eliminado: true };
  }

  /** Token corto para ver un borrador en la web pública (HMAC con el secreto del JWT; vence en 20 min). */
  tokenVistaPrevia(landingId: string) {
    const exp = Date.now() + PREVIEW_MIN * 60_000;
    return `${exp}.${this.firma(`${landingId}.${exp}`)}`;
  }

  // ------------------------------------------------------------------ público

  /** Landing publicada (o borrador con token de vista previa válido) lista para pintar en la web. */
  async publica(marcaId: string, slug: string, preview?: string) {
    const l = await this.prisma.landing.findFirst({ where: { marcaId, slug } });
    if (!l) throw new NotFoundException('Landing no encontrada');
    if (l.estado !== 'PUBLICADA' && !this.previewValido(l.id, preview)) throw new NotFoundException('Landing no encontrada');
    return { nombre: l.nombre, slug: l.slug, plantilla: l.plantilla, estado: l.estado, contenido: l.contenido, formulario: l.formulario };
  }

  async registrar(marcaId: string, slug: string, dto: RegistroPublicoDto, ip: string) {
    // Honeypot: se responde "ok" sin guardar para no darle pistas al bot.
    if (dto.website) return { ok: true as const };
    this.limitar(`${marcaId}:${ip}`);
    const l = await this.prisma.landing.findFirst({ where: { marcaId, slug, estado: 'PUBLICADA' } });
    if (!l) throw new NotFoundException('Landing no encontrada');
    const formulario = l.formulario as unknown as Formulario;
    let datos: Record<string, string | boolean>;
    try { datos = validarRegistro(formulario, dto.datos); } catch (e) { throw new BadRequestException((e as Error).message); }
    const { nombre, email, celular } = resumenContacto(formulario, datos);
    await this.prisma.landingRegistro.create({
      data: { marcaId, landingId: l.id, datos: datos as never, nombre, email, celular, origen: dto.origen?.trim() || null },
    });
    this.avisarEquipo(marcaId, l.nombre, nombre ?? email ?? 'Alguien').catch((e) => this.logger.error('No se pudo avisar del registro', e as Error));
    return { ok: true as const };
  }

  // ------------------------------------------------------------------ interno

  private firma(texto: string) {
    return createHmac('sha256', process.env.JWT_ACCESS_SECRET ?? 'dev').update(`landing-preview:${texto}`).digest('hex').slice(0, 32);
  }

  private previewValido(landingId: string, token?: string) {
    if (!token) return false;
    const [exp, firma] = token.split('.');
    if (!exp || !firma || Number(exp) < Date.now()) return false;
    const esperado = Buffer.from(this.firma(`${landingId}.${exp}`));
    const recibido = Buffer.from(firma);
    return esperado.length === recibido.length && timingSafeEqual(esperado, recibido);
  }

  private async campanaValida(marcaId: string, campanaId: string) {
    const c = await this.prisma.campana.findFirst({ where: { id: campanaId, marcaId } });
    if (!c) throw new ForbiddenException('La campaña no pertenece a esta marca');
  }

  private async slugLibre(marcaId: string, base: string) {
    let slug = slugDe(base);
    for (let n = 2; await this.prisma.landing.findFirst({ where: { marcaId, slug } }); n++) slug = `${slugDe(base)}-${n}`.slice(0, 60);
    return slug;
  }

  private limitar(clave: string) {
    const ahora = Date.now();
    const recientes = (intentos.get(clave) ?? []).filter((t) => ahora - t < VENTANA_MS);
    if (recientes.length >= MAX_POR_VENTANA) {
      throw new HttpException('Demasiados envíos seguidos. Intenta de nuevo en unos minutos.', HttpStatus.TOO_MANY_REQUESTS);
    }
    recientes.push(ahora);
    intentos.set(clave, recientes);
    if (intentos.size > 5000) for (const [k, v] of intentos) if (!v.some((t) => ahora - t < VENTANA_MS)) intentos.delete(k);
  }

  private async avisarEquipo(marcaId: string, landing: string, quien: string) {
    const asignaciones = await this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { in: ROLES_AVISO } } },
      include: { usuario: { select: { id: true, activo: true } } },
    });
    const ids = [...new Set(asignaciones.filter((a) => a.usuario.activo).map((a) => a.usuario.id))];
    if (!ids.length) return;
    await this.prisma.notificacion.createMany({
      data: ids.map((usuarioId) => ({ marcaId, usuarioId, tipo: 'SISTEMA' as const, titulo: 'Nuevo registro en una landing', mensaje: `${quien} se registró en “${landing}”`.slice(0, 140) })),
    });
  }

  private async notificar(marcaId: string, roles: string[], titulo: string, mensaje: string, excluir?: string) {
    const asignaciones = await this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { in: roles } } },
      include: { usuario: { select: { id: true, activo: true } } },
    });
    const ids = [...new Set(asignaciones.filter((a) => a.usuario.activo && a.usuario.id !== excluir).map((a) => a.usuario.id))];
    if (!ids.length) return;
    await this.prisma.notificacion.createMany({ data: ids.map((usuarioId) => ({ marcaId, usuarioId, tipo: 'SISTEMA' as const, titulo, mensaje: mensaje.slice(0, 140) })) });
  }

  private async avisarUsuario(marcaId: string, usuarioId: string, titulo: string, mensaje: string) {
    await this.prisma.notificacion.create({ data: { marcaId, usuarioId, tipo: 'SISTEMA', titulo, mensaje: mensaje.slice(0, 140) } });
  }
}
