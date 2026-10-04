import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { normalizarCelular } from '../cotizador/cotizador.service.js';
import type { ActualizarTicketDto, CrearTicketDto } from './tickets.dto.js';

const ROLES_AVISO = ['admin', 'comercial'];
const ETIQUETA = { RECLAMO: 'Reclamo', VERIFICACION: 'Verificación', SOPORTE: 'Soporte técnico' } as const;

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // ------------------------------------------------------------------ público

  async crearPublico(marcaId: string, dto: CrearTicketDto) {
    // Honeypot: se responde "ok" sin guardar para no darle pistas al bot.
    if (dto.website) return { ok: true as const, numero: null as string | null };
    const marca = await this.prisma.marca.findUnique({ where: { id: marcaId } });
    if (!marca) throw new BadRequestException('Marca inválida');

    // Solo se aceptan evidencias subidas por nuestro endpoint (carpeta evidencias de esta marca).
    const evidencias = (dto.evidencias ?? []).filter((u) => new RegExp(`/uploads/${marcaId}/evidencias/[0-9a-f-]{36}\.(jpg|png|gif|webp|pdf)$`).test(u));
    const telefono = dto.celular?.trim();
    const celular = telefono ? normalizarCelular(telefono) : null;
    const descripcion = telefono && !celular ? `${dto.descripcion.trim()}\n\nTeléfono: ${telefono}` : dto.descripcion.trim();

    const numero = `TCK-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const t = await this.prisma.ticket.create({
      data: {
        marcaId,
        numero,
        tipo: dto.tipo,
        esEmpresa: !!dto.esEmpresa,
        documento: dto.documento?.trim() || null,
        nombre: dto.nombre.trim(),
        email: dto.email.trim().toLowerCase(),
        celular,
        numeroCompra: dto.numeroCompra?.trim() || null,
        fechaCompra: dto.fechaCompra?.trim() || null,
        producto: dto.producto?.trim() || null,
        comprobante: dto.comprobante?.trim() || null,
        descripcion,
        evidencias,
        origen: dto.origen?.trim() || null,
      },
    });
    this.avisarEquipo(marcaId, t.id, t.nombre, t.numero, t.tipo).catch((e) => this.logger.error('No se pudo avisar al equipo del ticket nuevo', e as Error));
    return { ok: true as const, numero: t.numero };
  }

  // ---------------------------------------------------------------- dashboard

  list(marcaId: string) {
    return this.prisma.ticket.findMany({ where: { marcaId }, orderBy: { createdAt: 'desc' }, take: 1000 });
  }

  async get(marcaId: string, id: string) {
    const t = await this.prisma.ticket.findFirst({ where: { id, marcaId } });
    if (!t) throw new NotFoundException('Ticket no encontrado');
    return t;
  }

  async actualizar(marcaId: string, id: string, dto: ActualizarTicketDto, email: string) {
    await this.get(marcaId, id);
    return this.prisma.ticket.update({ where: { id, marcaId }, data: { ...dto, atendidoPor: email } });
  }

  async eliminar(marcaId: string, id: string) {
    await this.get(marcaId, id);
    await this.prisma.ticket.delete({ where: { id, marcaId } });
    return { ok: true as const };
  }

  // ------------------------------------------------------------------ interno

  private async avisarEquipo(marcaId: string, id: string, nombre: string, numero: string, tipo: keyof typeof ETIQUETA) {
    const asignaciones = await this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { in: ROLES_AVISO } } },
      include: { usuario: { select: { id: true, email: true, activo: true } } },
    });
    const usuarios = [...new Map(asignaciones.filter((a) => a.usuario.activo).map((a) => [a.usuario.id, a.usuario])).values()];
    if (usuarios.length === 0) return;
    const url = `${process.env.WEB_ORIGIN ?? 'http://localhost:3000'}/soporte/tickets?id=${id}`;
    await this.prisma.notificacion.createMany({
      data: usuarios.map((u) => ({ marcaId, usuarioId: u.id, tipo: 'SISTEMA' as const, titulo: `Nuevo ticket · ${ETIQUETA[tipo]}`, mensaje: `${nombre} abrió el ticket ${numero}`.slice(0, 140) })),
    });
    await Promise.all(usuarios.map((u) => this.mail.sendLeadNuevo(u.email, nombre, `Ticket ${numero} · ${ETIQUETA[tipo]}`, url)));
  }
}
