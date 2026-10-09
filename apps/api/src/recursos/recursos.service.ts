import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { unlink } from 'node:fs/promises';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { CuentaService } from '../cuenta/cuenta.service.js';
import { TicketsService } from '../tickets/tickets.service.js';
import { UploadsService, rutaPrivada } from '../uploads/uploads.service.js';
import { normalizeEmail } from '../common/utils/normalize-email.js';
import { normalizarCelular } from '../cotizador/cotizador.service.js';
import type { ActualizarRecursoDto, ActualizarSocioDto, CrearRecursoDto, CrearSocioDto, RegistroSocioDto } from './recursos.dto.js';

const ROLES_AVISO = ['admin', 'comercial'];
const web = () => process.env.WEB_PUBLICA_URL ?? 'https://fptecnologi.com';
const UNA_HORA = 60 * 60 * 1000;

@Injectable()
export class RecursosService {
  private readonly logger = new Logger(RecursosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly cuenta: CuentaService,
    private readonly tickets: TicketsService,
    private readonly uploads: UploadsService,
  ) {}

  // ------------------------------------------------------------------ público: registro

  /** Solicitud de una empresa para ser socia. Responde siempre igual (no revela si el correo ya existe). */
  async registrar(marcaId: string, dto: RegistroSocioDto) {
    if (dto.website) return { ok: true as const };
    if (!(await this.prisma.marca.findUnique({ where: { id: marcaId } }))) throw new BadRequestException('Marca inválida');
    const email = normalizeEmail(dto.email);
    if (!(await this.prisma.socio.findFirst({ where: { marcaId, email } }))) {
      const celular = dto.celular?.trim() ? normalizarCelular(dto.celular.trim()) : null;
      const s = await this.prisma.socio.create({
        data: { marcaId, email, nombre: dto.nombre.trim(), empresa: dto.empresa.trim(), ruc: dto.ruc, cargo: dto.cargo?.trim() || null, celular, mensaje: dto.mensaje?.trim() || null, estado: 'PENDIENTE' },
      });
      this.avisarEquipo(marcaId, s.id, s.empresa ?? s.email).catch((e) => this.logger.error('No se pudo avisar al equipo del socio nuevo', e as Error));
      this.mail
        .sendAviso(email, { asunto: 'Recibimos tu solicitud de socio', titulo: 'Solicitud recibida', parrafos: [`Hola ${dto.nombre.trim()}, recibimos la solicitud de ${dto.empresa.trim()} para ser socio de FP Tecnologi. Nuestro equipo la revisará y te avisaremos por este correo cuando tengas acceso a la intranet de socios.`] })
        .catch(() => undefined);
    }
    return { ok: true as const };
  }

  // ------------------------------------------------------------------ público: intranet de socios

  /** Valida sesión + que el correo sea de un socio ACTIVO. Devuelve el socio (y marca su último acceso). */
  private async socioActivo(marcaId: string, token: string | undefined) {
    const email = this.cuenta.leerToken(token, marcaId);
    const socio = await this.prisma.socio.findFirst({ where: { marcaId, email } });
    if (!socio || socio.estado !== 'ACTIVO') throw new ForbiddenException(socio?.estado === 'PENDIENTE' ? 'Tu solicitud de socio sigue en revisión.' : 'Tu cuenta no tiene acceso a la intranet de socios.');
    if (!socio.ultimoAcceso || Date.now() - socio.ultimoAcceso.getTime() > UNA_HORA) {
      await this.prisma.socio.update({ where: { id: socio.id, marcaId }, data: { ultimoAcceso: new Date() } });
    }
    return socio;
  }

  /** Estado del correo de la sesión frente a la intranet (para decidir qué pantalla mostrar). */
  async estadoDeSesion(marcaId: string, token: string | undefined) {
    const email = this.cuenta.leerToken(token, marcaId);
    const socio = await this.prisma.socio.findFirst({ where: { marcaId, email }, select: { estado: true } });
    return { estado: socio?.estado ?? null };
  }

  /** Todo lo de la intranet en una sola llamada: datos del socio, recursos visibles y sus tickets. */
  async portal(marcaId: string, token: string | undefined) {
    const socio = await this.socioActivo(marcaId, token);
    const [recursos, tickets, contenido] = await Promise.all([
      this.prisma.recurso.findMany({
        where: { marcaId, visible: true },
        orderBy: [{ fabricante: 'asc' }, { orden: 'asc' }, { createdAt: 'desc' }],
        select: { id: true, titulo: true, descripcion: true, tipo: true, fabricante: true, categoria: true, mime: true, bytes: true, createdAt: true },
      }),
      this.tickets.ticketsDeCorreo(marcaId, socio.email),
      // Novedades y beneficios que el equipo edita en el dashboard (Web informativa → Intranet de socios); solo para socios con sesión.
      this.prisma.contenidoWeb.findMany({ where: { marcaId, pagina: 'socios' } }),
    ]);
    const items = (seccion: string) => {
      const datos = contenido.find((c) => c.seccion === seccion)?.datos as { items?: { title?: string; text?: string }[] } | null | undefined;
      return (datos?.items ?? []).filter((i) => i.title?.trim()).map((i) => ({ title: String(i.title), text: String(i.text ?? '') }));
    };
    return { socio: { nombre: socio.nombre, empresa: socio.empresa, ruc: socio.ruc, email: socio.email, cargo: socio.cargo, celular: socio.celular, desde: socio.aprobadoAt ?? socio.createdAt }, recursos, tickets, novedades: items('novedades'), beneficios: items('beneficios') };
  }

  /** Descarga o vista previa de un recurso: solo con sesión de socio activo; cuenta una descarga si no es vista previa. */
  async descargar(marcaId: string, token: string | undefined, id: string, res: Response, inline: boolean) {
    await this.socioActivo(marcaId, token);
    const r = await this.prisma.recurso.findFirst({ where: { id, marcaId, visible: true } });
    if (!r) throw new NotFoundException('Recurso no encontrado');
    if (!inline) await this.prisma.recurso.update({ where: { id, marcaId }, data: { descargas: { increment: 1 } } });
    this.uploads.enviar(res, r.archivoUrl, { nombre: `${r.titulo}.${r.archivoUrl.split('.').pop()}`, inline });
  }

  // ---------------------------------------------------------------- dashboard: recursos

  listar(marcaId: string) {
    return this.prisma.recurso.findMany({ where: { marcaId }, orderBy: [{ fabricante: 'asc' }, { orden: 'asc' }, { createdAt: 'desc' }] });
  }

  async crear(marcaId: string, dto: CrearRecursoDto) {
    // El archivo debe haberse subido por POST /recursos/archivo a la carpeta privada de ESTA marca.
    if (!new RegExp(`^${marcaId}/recursos/[0-9a-f-]{36}\\.[a-z0-9]{2,5}$`).test(dto.clave) || !rutaPrivada(dto.clave)) throw new BadRequestException('Archivo no válido: súbelo primero.');
    return this.prisma.recurso.create({
      data: {
        marcaId,
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion?.trim() || null,
        tipo: dto.tipo,
        fabricante: dto.fabricante?.trim() || null,
        categoria: dto.categoria?.trim() || null,
        archivoUrl: dto.clave,
        mime: dto.mime ?? null,
        bytes: dto.bytes ?? 0,
        visible: dto.visible ?? true,
        orden: dto.orden ?? 0,
      },
    });
  }

  async actualizar(marcaId: string, id: string, dto: ActualizarRecursoDto) {
    await this.obtener(marcaId, id);
    return this.prisma.recurso.update({ where: { id, marcaId }, data: dto });
  }

  async eliminar(marcaId: string, id: string) {
    const r = await this.obtener(marcaId, id);
    await this.prisma.recurso.delete({ where: { id, marcaId } });
    const abs = rutaPrivada(r.archivoUrl);
    if (abs && r.archivoUrl.startsWith(`${marcaId}/`)) await unlink(abs).catch(() => undefined);
    return { ok: true as const };
  }

  /** Vista/descarga del equipo (dashboard), sin contar descargas. */
  async archivoParaEquipo(marcaId: string, id: string, res: Response) {
    const r = await this.obtener(marcaId, id);
    this.uploads.enviar(res, r.archivoUrl, { nombre: `${r.titulo}.${r.archivoUrl.split('.').pop()}`, inline: true });
  }

  private async obtener(marcaId: string, id: string) {
    const r = await this.prisma.recurso.findFirst({ where: { id, marcaId } });
    if (!r) throw new NotFoundException('Recurso no encontrado');
    return r;
  }

  // ---------------------------------------------------------------- dashboard: socios

  listarSocios(marcaId: string) {
    return this.prisma.socio.findMany({ where: { marcaId }, orderBy: [{ estado: 'asc' }, { createdAt: 'desc' }] });
  }

  async crearSocio(marcaId: string, dto: CrearSocioDto, por: string) {
    const email = normalizeEmail(dto.email);
    if (await this.prisma.socio.findFirst({ where: { marcaId, email } })) throw new ConflictException('Ese correo ya es socio.');
    const s = await this.prisma.socio.create({
      data: { marcaId, email, nombre: dto.nombre?.trim() || null, empresa: dto.empresa?.trim() || null, ruc: dto.ruc?.trim() || null, estado: 'ACTIVO', aprobadoPor: por, aprobadoAt: new Date() },
    });
    this.avisarAcceso(s.email, s.nombre);
    return s;
  }

  async actualizarSocio(marcaId: string, id: string, dto: ActualizarSocioDto, por: string) {
    const actual = await this.prisma.socio.findFirst({ where: { id, marcaId } });
    if (!actual) throw new NotFoundException('Socio no encontrado');
    const aprobando = dto.estado === 'ACTIVO' && actual.estado !== 'ACTIVO';
    const s = await this.prisma.socio.update({ where: { id, marcaId }, data: { ...dto, ...(aprobando ? { aprobadoPor: por, aprobadoAt: new Date() } : {}) } });
    if (aprobando) this.avisarAcceso(s.email, s.nombre);
    return s;
  }

  async eliminarSocio(marcaId: string, id: string) {
    if (!(await this.prisma.socio.findFirst({ where: { id, marcaId } }))) throw new NotFoundException('Socio no encontrado');
    await this.prisma.socio.delete({ where: { id, marcaId } });
    return { ok: true as const };
  }

  // ------------------------------------------------------------------ interno

  private avisarAcceso(email: string, nombre: string | null) {
    this.mail
      .sendAviso(email, {
        asunto: 'Ya tienes acceso a la intranet de socios',
        titulo: 'Tu acceso fue aprobado',
        parrafos: [`${nombre ? `Hola ${nombre}, ya` : 'Ya'} puedes entrar a la intranet de socios de FP Tecnologi con este correo: te enviaremos un código de acceso cada vez que ingreses.`],
        boton: { texto: 'Entrar a la intranet', url: `${web()}/socios` },
      })
      .catch(() => undefined);
  }

  private async avisarEquipo(marcaId: string, id: string, empresa: string) {
    const asignaciones = await this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { in: ROLES_AVISO } } },
      include: { usuario: { select: { id: true, email: true, activo: true } } },
    });
    const usuarios = [...new Map(asignaciones.filter((a) => a.usuario.activo).map((a) => [a.usuario.id, a.usuario])).values()];
    if (usuarios.length === 0) return;
    const url = `${process.env.WEB_ORIGIN ?? 'http://localhost:3000'}/web/recursos?socio=${id}`;
    await this.prisma.notificacion.createMany({
      data: usuarios.map((u) => ({ marcaId, usuarioId: u.id, tipo: 'SISTEMA' as const, titulo: 'Nueva solicitud de socio', mensaje: `${empresa} pidió ser socio`.slice(0, 140) })),
    });
    await Promise.all(usuarios.map((u) => this.mail.sendLeadNuevo(u.email, empresa, 'Solicitud de socio', url)));
  }
}
