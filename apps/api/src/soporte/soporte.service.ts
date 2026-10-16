import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';

const MAX = 300;

@Injectable()
export class SoporteService {
  constructor(private readonly prisma: PrismaService, private readonly mail: MailService) {}

  async crear(usuarioId: string, marcaId: string | undefined, d: { asunto: string; categoria: string; mensaje: string }) {
    // La marca es solo contexto del ticket: se acepta únicamente si el usuario pertenece a ella.
    const pertenece = marcaId ? await this.prisma.usuarioMarcaRol.findFirst({ where: { usuarioId, marcaId }, select: { marcaId: true } }) : null;
    return this.prisma.soporteTicket.create({
      data: { usuarioId, marcaId: pertenece ? marcaId : null, asunto: d.asunto.trim(), categoria: d.categoria.trim(), mensaje: d.mensaje.trim() },
    });
  }

  mios(usuarioId: string) {
    return this.prisma.soporteTicket.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      take: MAX,
      include: { marca: { select: { nombre: true } } },
    });
  }

  async listar(f: { estado?: string; marcaId?: string; q?: string }) {
    const q = f.q?.trim();
    const tickets = await this.prisma.soporteTicket.findMany({
      where: {
        ...(f.estado ? { estado: f.estado } : {}),
        ...(f.marcaId ? { marcaId: f.marcaId } : {}),
        ...(q ? { OR: [
          { asunto: { contains: q, mode: 'insensitive' as const } },
          { mensaje: { contains: q, mode: 'insensitive' as const } },
          { usuario: { email: { contains: q, mode: 'insensitive' as const } } },
        ] } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: MAX,
      include: { marca: { select: { nombre: true } }, usuario: { select: { email: true, nombre: true } } },
    });
    const marcas = await this.prisma.marca.findMany({ select: { id: true, nombre: true }, orderBy: { nombre: 'asc' } });
    return { tickets, marcas };
  }

  /** Cambia el estado y/o responde. Si hay respuesta nueva, avisa por correo al usuario. */
  async atender(id: string, adminEmail: string, d: { estado?: string; respuesta?: string }) {
    const t = await this.prisma.soporteTicket.findUnique({ where: { id }, include: { usuario: { select: { email: true } } } });
    if (!t) throw new NotFoundException('Ticket no encontrado');
    const respuesta = d.respuesta?.trim();
    if (d.respuesta !== undefined && !respuesta) throw new BadRequestException('La respuesta no puede estar vacía');
    const nueva = !!respuesta && respuesta !== t.respuesta;
    const estado = d.estado ?? (nueva && t.estado === 'ABIERTO' ? 'EN_REVISION' : undefined);
    const actualizado = await this.prisma.soporteTicket.update({
      where: { id },
      data: {
        ...(estado ? { estado } : {}),
        ...(nueva ? { respuesta, respondidoPor: adminEmail, respondidoAt: new Date() } : {}),
      },
    });
    if (nueva) {
      await this.mail.sendAviso(t.usuario.email, {
        asunto: `Respuesta a tu ticket: ${t.asunto}`,
        titulo: 'Respondimos tu ticket de soporte',
        parrafos: [`Asunto: ${t.asunto}`, respuesta!],
      });
    }
    return actualizado;
  }
}
