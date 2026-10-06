import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { normalizarCelular } from '../cotizador/cotizador.service.js';
import { normalizeEmail } from '../common/utils/normalize-email.js';
import type { ActualizarTicketDto, CrearTicketDto, MensajeEquipoDto, ResponderTicketDto } from './tickets.dto.js';

const ROLES_AVISO = ['admin', 'comercial'];
const ETIQUETA = { RECLAMO: 'Reclamo', VERIFICACION: 'Verificación', SOPORTE: 'Soporte técnico' } as const;
const ESTADO_TXT = { NUEVO: 'Nuevo', EN_REVISION: 'En revisión', ESPERANDO_CLIENTE: 'Esperando tu respuesta', RESUELTO: 'Resuelto', CERRADO: 'Cerrado' } as const;
const web = () => process.env.WEB_PUBLICA_URL ?? 'https://fptecnologi.com';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  /** Las evidencias son claves privadas subidas por nuestro endpoint a la carpeta de ESTA marca. */
  private clavesValidas(marcaId: string, claves: string[] | undefined) {
    const re = new RegExp(`^${marcaId}/evidencias/[0-9a-f-]{36}\\.(jpg|png|gif|webp|pdf)$`);
    return (claves ?? []).filter((c) => re.test(c));
  }

  // ------------------------------------------------------------------ público

  async crearPublico(marcaId: string, dto: CrearTicketDto) {
    // Honeypot: se responde "ok" sin guardar para no darle pistas al bot.
    if (dto.website) return { ok: true as const, numero: null as string | null };
    const marca = await this.prisma.marca.findUnique({ where: { id: marcaId } });
    if (!marca) throw new BadRequestException('Marca inválida');

    const telefono = dto.celular?.trim();
    const celular = telefono ? normalizarCelular(telefono) : null;
    const descripcion = telefono && !celular ? `${dto.descripcion.trim()}\n\nTeléfono: ${telefono}` : dto.descripcion.trim();
    const email = normalizeEmail(dto.email);
    const numero = `TCK-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const t = await this.prisma.ticket.create({
      data: {
        marcaId,
        numero,
        tipo: dto.tipo,
        esEmpresa: !!dto.esEmpresa,
        documento: dto.documento?.trim() || null,
        nombre: dto.nombre.trim(),
        email,
        celular,
        numeroCompra: dto.numeroCompra?.trim() || null,
        fechaCompra: dto.fechaCompra?.trim() || null,
        producto: dto.producto?.trim() || null,
        comprobante: dto.comprobante?.trim() || null,
        descripcion,
        evidencias: this.clavesValidas(marcaId, dto.evidencias),
        origen: dto.origen?.trim() || null,
        mensajes: { create: { marcaId, autor: 'SISTEMA', texto: 'Ticket creado.' } },
      },
    });
    this.avisarEquipo(marcaId, t.id, t.nombre, t.numero, `Nuevo ticket · ${ETIQUETA[t.tipo]}`, `${t.nombre} abrió el ticket ${t.numero}`).catch((e) => this.logger.error('No se pudo avisar al equipo del ticket nuevo', e as Error));
    this.mail
      .sendAviso(email, {
        asunto: `Recibimos tu ticket ${numero}`,
        titulo: 'Recibimos tu ticket',
        parrafos: [`Hola ${t.nombre}, registramos tu caso (${ETIQUETA[t.tipo]}) con el número ${numero}. Un asesor lo revisará y te responderá por este medio.`, 'Guarda este número: con él y tu correo puedes ver el estado y responder desde nuestra web.'],
        boton: { texto: 'Ver seguimiento', url: `${web()}/tickets/seguimiento?n=${encodeURIComponent(numero)}` },
      })
      .catch(() => undefined);
    return { ok: true as const, numero: t.numero };
  }

  /** Vista pública de un ticket: sin notas internas ni datos del equipo. null si número y correo no coinciden. */
  private async buscarPublico(marcaId: string, numero: string, emailRaw: string) {
    const t = await this.prisma.ticket.findFirst({ where: { marcaId, numero: numero.trim().toUpperCase(), email: normalizeEmail(emailRaw) } });
    if (!t) throw new NotFoundException('No encontramos un ticket con ese número y correo.');
    return t;
  }

  async seguimiento(marcaId: string, numero: string, email: string) {
    const t = await this.buscarPublico(marcaId, numero, email);
    const mensajes = await this.prisma.ticketMensaje.findMany({ where: { ticketId: t.id, marcaId, interno: false }, orderBy: { createdAt: 'asc' }, select: { id: true, autor: true, autorNombre: true, texto: true, createdAt: true } });
    return { numero: t.numero, tipo: t.tipo, estado: t.estado, producto: t.producto, descripcion: t.descripcion, createdAt: t.createdAt, resueltoAt: t.resueltoAt, mensajes };
  }

  async responderPublico(marcaId: string, dto: ResponderTicketDto) {
    const t = await this.buscarPublico(marcaId, dto.numero, dto.email);
    if (t.estado === 'CERRADO') throw new ForbiddenException('Este ticket está cerrado. Abre uno nuevo si necesitas más ayuda.');
    await this.prisma.ticketMensaje.create({ data: { ticketId: t.id, marcaId, autor: 'CLIENTE', autorNombre: t.nombre, texto: dto.texto.trim(), adjuntos: this.clavesValidas(marcaId, dto.adjuntos) } });
    // Una respuesta del cliente reabre el ticket para el equipo.
    if (t.estado !== 'NUEVO' && t.estado !== 'EN_REVISION') {
      await this.prisma.ticket.update({ where: { id: t.id, marcaId }, data: { estado: 'EN_REVISION', resueltoAt: null } });
      await this.prisma.ticketMensaje.create({ data: { ticketId: t.id, marcaId, autor: 'SISTEMA', texto: 'El cliente respondió: el ticket vuelve a En revisión.' } });
    }
    this.avisarEquipo(marcaId, t.id, t.nombre, t.numero, `Respuesta en ticket ${t.numero}`, `${t.nombre} respondió el ticket ${t.numero}`).catch(() => undefined);
    return { ok: true as const };
  }

  /** Tickets de un correo (para la intranet de socios), sin datos internos. */
  ticketsDeCorreo(marcaId: string, email: string) {
    return this.prisma.ticket.findMany({ where: { marcaId, email }, orderBy: { createdAt: 'desc' }, take: 50, select: { id: true, numero: true, tipo: true, estado: true, producto: true, createdAt: true } });
  }

  // ---------------------------------------------------------------- dashboard

  list(marcaId: string) {
    return this.prisma.ticket.findMany({ where: { marcaId }, orderBy: { createdAt: 'desc' }, take: 1000, include: { _count: { select: { mensajes: true } } } });
  }

  async get(marcaId: string, id: string) {
    const t = await this.prisma.ticket.findFirst({ where: { id, marcaId }, include: { mensajes: { orderBy: { createdAt: 'asc' } } } });
    if (!t) throw new NotFoundException('Ticket no encontrado');
    return t;
  }

  /** Cambios de estado, prioridad, responsable o notas; cada cambio queda en el historial del ticket. */
  async actualizar(marcaId: string, id: string, dto: ActualizarTicketDto, email: string) {
    const t = await this.get(marcaId, id);
    const data: Record<string, unknown> = { atendidoPor: email };
    const eventos: string[] = [];
    if (dto.estado && dto.estado !== t.estado) {
      data.estado = dto.estado;
      data.resueltoAt = dto.estado === 'RESUELTO' || dto.estado === 'CERRADO' ? (t.resueltoAt ?? new Date()) : null;
      eventos.push(`Estado: ${ESTADO_TXT[t.estado]} → ${ESTADO_TXT[dto.estado]}`);
    }
    if (dto.prioridad && dto.prioridad !== t.prioridad) {
      data.prioridad = dto.prioridad;
      eventos.push(`Prioridad: ${t.prioridad} → ${dto.prioridad}`);
    }
    if (dto.asignadoA !== undefined && (dto.asignadoA || null) !== t.asignadoA) {
      data.asignadoA = dto.asignadoA || null;
      eventos.push(dto.asignadoA ? `Asignado a ${dto.asignadoA}` : 'Sin responsable');
    }
    if (dto.notas !== undefined) data.notas = dto.notas;
    const actualizado = await this.prisma.ticket.update({ where: { id, marcaId }, data });
    for (const texto of eventos) await this.prisma.ticketMensaje.create({ data: { ticketId: id, marcaId, autor: 'SISTEMA', autorNombre: email, texto, interno: true } });
    if (dto.estado && dto.estado !== t.estado && (dto.estado === 'RESUELTO' || dto.estado === 'CERRADO')) {
      this.mail
        .sendAviso(t.email, {
          asunto: `Tu ticket ${t.numero} está ${dto.estado === 'RESUELTO' ? 'resuelto' : 'cerrado'}`,
          titulo: `Ticket ${dto.estado === 'RESUELTO' ? 'resuelto' : 'cerrado'}`,
          parrafos: [`Hola ${t.nombre}, tu ticket ${t.numero} pasó a "${ESTADO_TXT[dto.estado]}". Si necesitas algo más, responde desde el seguimiento.`],
          boton: { texto: 'Ver seguimiento', url: `${web()}/tickets/seguimiento?n=${encodeURIComponent(t.numero)}` },
        })
        .catch(() => undefined);
    }
    return actualizado;
  }

  /** Respuesta del equipo (se envía al cliente) o nota interna. Opcionalmente cambia el estado en el mismo paso. */
  async responder(marcaId: string, id: string, dto: MensajeEquipoDto, email: string) {
    const t = await this.get(marcaId, id);
    const interno = !!dto.interno;
    await this.prisma.ticketMensaje.create({ data: { ticketId: id, marcaId, autor: 'EQUIPO', autorNombre: email, texto: dto.texto.trim(), interno } });
    if (!interno) {
      // La primera respuesta pública saca el ticket de «Nuevo».
      const estado = dto.estado ?? (t.estado === 'NUEVO' ? 'EN_REVISION' : undefined);
      if (estado && estado !== t.estado) {
        await this.prisma.ticket.update({ where: { id, marcaId }, data: { estado, atendidoPor: email, resueltoAt: estado === 'RESUELTO' ? new Date() : null } });
        await this.prisma.ticketMensaje.create({ data: { ticketId: id, marcaId, autor: 'SISTEMA', autorNombre: email, texto: `Estado: ${ESTADO_TXT[t.estado]} → ${ESTADO_TXT[estado]}`, interno: true } });
      }
      this.mail
        .sendAviso(t.email, {
          asunto: `Respuesta a tu ticket ${t.numero}`,
          titulo: 'Tenemos una respuesta para ti',
          parrafos: [dto.texto.trim()],
          boton: { texto: 'Ver y responder', url: `${web()}/tickets/seguimiento?n=${encodeURIComponent(t.numero)}` },
        })
        .catch(() => undefined);
    }
    return this.get(marcaId, id);
  }

  async eliminar(marcaId: string, id: string) {
    await this.get(marcaId, id);
    await this.prisma.ticket.delete({ where: { id, marcaId } });
    return { ok: true as const };
  }

  /** ¿La clave de archivo pertenece a algún ticket de esta marca? (para servirla al equipo). */
  async clavePerteneceAMarca(marcaId: string, clave: string) {
    if (!clave.startsWith(`${marcaId}/evidencias/`)) return false;
    const n = await this.prisma.ticket.count({ where: { marcaId, evidencias: { has: clave } } });
    if (n > 0) return true;
    return (await this.prisma.ticketMensaje.count({ where: { marcaId, adjuntos: { has: clave } } })) > 0;
  }

  // ------------------------------------------------------------------ interno

  private async avisarEquipo(marcaId: string, id: string, nombre: string, numero: string, titulo: string, mensaje: string) {
    const asignaciones = await this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { in: ROLES_AVISO } } },
      include: { usuario: { select: { id: true, email: true, activo: true } } },
    });
    const usuarios = [...new Map(asignaciones.filter((a) => a.usuario.activo).map((a) => [a.usuario.id, a.usuario])).values()];
    if (usuarios.length === 0) return;
    const url = `${process.env.WEB_ORIGIN ?? 'http://localhost:3000'}/web/tickets?id=${id}`;
    await this.prisma.notificacion.createMany({
      data: usuarios.map((u) => ({ marcaId, usuarioId: u.id, tipo: 'SISTEMA' as const, titulo, mensaje: mensaje.slice(0, 140) })),
    });
    await Promise.all(usuarios.map((u) => this.mail.sendLeadNuevo(u.email, nombre, `Ticket ${numero} · ${titulo}`, url)));
  }
}
