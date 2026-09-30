import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import type { CreateChatAsesorDto, UpdateChatAsesorDto } from './dto/asesor.dto.js';
import type { MensajePublicoDto } from './dto/mensaje.dto.js';

// Tope por conversación: el endpoint público no tiene login ni throttler
// (deshabilitado, ver app.module), así que se limita el tamaño por acá.
const MAX_MENSAJES = 300;
// Roles que reciben el aviso de conversación nueva.
const ROLES_AVISO = ['admin', 'asesores'];

type EstadoChat = 'BOT' | 'ASESOR' | 'CERRADA';
type AutorChat = 'CLIENTE' | 'BOT' | 'ASESOR';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // ---------------------------------------------------------------- asesores

  listAsesores(marcaId: string, soloActivos = false) {
    return this.prisma.chatAsesor.findMany({
      where: { marcaId, ...(soloActivos ? { activo: true } : {}) },
      orderBy: [{ orden: 'asc' }, { createdAt: 'asc' }],
    });
  }

  createAsesor(marcaId: string, dto: CreateChatAsesorDto) {
    return this.prisma.chatAsesor.create({ data: { ...dto, marcaId } });
  }

  async updateAsesor(marcaId: string, id: string, dto: UpdateChatAsesorDto) {
    await this.findAsesor(marcaId, id);
    return this.prisma.chatAsesor.update({ where: { id, marcaId }, data: dto });
  }

  async deleteAsesor(marcaId: string, id: string) {
    await this.findAsesor(marcaId, id);
    await this.prisma.chatAsesor.delete({ where: { id, marcaId } });
    return { success: true };
  }

  private async findAsesor(marcaId: string, id: string) {
    const asesor = await this.prisma.chatAsesor.findFirst({ where: { id, marcaId } });
    if (!asesor) throw new NotFoundException('Asesor no encontrado');
    return asesor;
  }

  // ------------------------------------------------------- dashboard (bandeja)

  async listConversaciones(marcaId: string, estado?: string) {
    const estados: EstadoChat[] = ['BOT', 'ASESOR', 'CERRADA'];
    const filtro = estados.includes(estado as EstadoChat) ? { estado: estado as EstadoChat } : {};
    const rows = await this.prisma.chatConversacion.findMany({
      where: { marcaId, ...filtro },
      orderBy: { updatedAt: 'desc' },
      take: 200,
      include: {
        asesor: { select: { id: true, nombre: true, email: true } },
        mensajes: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { mensajes: true } },
      },
    });
    // El token del visitante nunca sale hacia el dashboard.
    return rows.map(({ mensajes, _count, token: _token, ...c }) => ({
      ...c,
      ultimoMensaje: mensajes[0] ?? null,
      totalMensajes: _count.mensajes,
    }));
  }

  async getConversacion(marcaId: string, id: string) {
    const conv = await this.prisma.chatConversacion.findFirst({
      where: { id, marcaId },
      include: {
        asesor: { select: { id: true, nombre: true, email: true } },
        mensajes: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!conv) throw new NotFoundException('Conversación no encontrada');
    const { token: _token, ...rest } = conv;
    return rest;
  }

  async tomar(marcaId: string, id: string, usuarioId: string) {
    await this.getConversacion(marcaId, id);
    return this.prisma.chatConversacion.update({
      where: { id, marcaId },
      data: { estado: 'ASESOR', asesorId: usuarioId },
      select: { id: true, estado: true, asesorId: true },
    });
  }

  async cambiarEstado(marcaId: string, id: string, estado: EstadoChat) {
    await this.getConversacion(marcaId, id);
    return this.prisma.chatConversacion.update({
      where: { id, marcaId },
      data: { estado, ...(estado === 'BOT' ? { asesorId: null } : {}) },
      select: { id: true, estado: true, asesorId: true },
    });
  }

  async responder(marcaId: string, id: string, usuarioId: string, texto: string) {
    const conv = await this.getConversacion(marcaId, id);
    if (conv.estado === 'CERRADA') throw new BadRequestException('La conversación está cerrada');
    // Primero hay que retomarla (así el cliente ve "X se unió al chat" antes
    // del primer mensaje del asesor).
    if (conv.estado !== 'ASESOR' || conv.asesorId !== usuarioId) {
      throw new BadRequestException('Primero retoma la conversación');
    }
    return this.addMensaje(marcaId, id, 'ASESOR', texto);
  }

  // --------------------------------------------------------- web pública

  async crearPublica(marcaId: string, paginaOrigen?: string) {
    const marca = await this.prisma.marca.findUnique({ where: { id: marcaId }, select: { id: true } });
    if (!marca) throw new BadRequestException('Marca inválida');
    const token = randomBytes(24).toString('hex');
    return this.prisma.chatConversacion.create({
      data: { marcaId, token, paginaOrigen },
      select: { id: true, token: true },
    });
  }

  async mensajePublico(marcaId: string, id: string, dto: MensajePublicoDto) {
    const conv = await this.porToken(marcaId, id, dto.token);
    if (conv.estado === 'CERRADA') throw new ForbiddenException('La conversación está cerrada');
    const total = await this.prisma.chatMensaje.count({ where: { marcaId, conversacionId: id } });
    if (total >= MAX_MENSAJES) throw new BadRequestException('La conversación alcanzó el máximo de mensajes');

    const msg = await this.addMensaje(marcaId, id, dto.autor, dto.texto);
    // Primer mensaje del visitante: título + aviso al equipo (sistema + correo).
    if (dto.autor === 'CLIENTE' && !conv.titulo) {
      await this.prisma.chatConversacion.update({
        where: { id, marcaId },
        data: { titulo: dto.texto.slice(0, 80) },
      });
      void this.avisarEquipo(marcaId, id, dto.texto).catch((e) => this.logger.error('Aviso de chat falló', e as Error));
    }
    return { id: msg.id, autor: msg.autor, texto: msg.texto, createdAt: msg.createdAt };
  }

  /** Lo que el widget consulta cada pocos segundos: estado + mensajes nuevos. */
  // conFoto: la foto de perfil puede ser un data: URI pesado -- el widget la
  // pide una sola vez (foto=1), no en cada consulta periódica.
  async estadoPublico(marcaId: string, id: string, token: string, desde?: string, conFoto = false) {
    const conv = await this.porToken(marcaId, id, token);
    const after = desde ? new Date(desde) : null;
    const mensajes = await this.prisma.chatMensaje.findMany({
      where: {
        marcaId,
        conversacionId: id,
        ...(after && !Number.isNaN(after.getTime()) ? { createdAt: { gt: after } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true, autor: true, texto: true, createdAt: true },
    });
    const asesor = conv.asesorId
      ? await this.prisma.usuario.findUnique({ where: { id: conv.asesorId }, select: { nombre: true, avatarUrl: conFoto } })
      : null;
    return { estado: conv.estado, asesor, mensajes };
  }

  private async porToken(marcaId: string, id: string, token: string) {
    if (!token) throw new NotFoundException('Conversación no encontrada');
    const conv = await this.prisma.chatConversacion.findFirst({ where: { id, marcaId, token } });
    if (!conv) throw new NotFoundException('Conversación no encontrada');
    return conv;
  }

  private async addMensaje(marcaId: string, conversacionId: string, autor: AutorChat, texto: string) {
    const msg = await this.prisma.chatMensaje.create({ data: { marcaId, conversacionId, autor, texto } });
    // Toca updatedAt para ordenar la bandeja por última actividad.
    await this.prisma.chatConversacion.update({
      where: { id: conversacionId, marcaId },
      data: { updatedAt: new Date() },
    });
    return msg;
  }

  private async avisarEquipo(marcaId: string, conversacionId: string, primerMensaje: string) {
    const asignaciones = await this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { in: ROLES_AVISO } } },
      include: { usuario: { select: { id: true, email: true, activo: true } } },
    });
    const usuarios = [
      ...new Map(asignaciones.filter((a) => a.usuario.activo).map((a) => [a.usuario.id, a.usuario])).values(),
    ];
    if (usuarios.length === 0) return;
    const url = `${process.env.WEB_ORIGIN ?? 'http://localhost:3000'}/chat/conversaciones?id=${conversacionId}`;
    await this.prisma.notificacion.createMany({
      data: usuarios.map((u) => ({
        marcaId,
        usuarioId: u.id,
        tipo: 'CHAT' as const,
        titulo: 'Nueva conversación en el chat de la web',
        mensaje: primerMensaje.slice(0, 140),
      })),
    });
    await Promise.all(usuarios.map((u) => this.mail.sendChatNuevo(u.email, primerMensaje, url)));
  }
}
