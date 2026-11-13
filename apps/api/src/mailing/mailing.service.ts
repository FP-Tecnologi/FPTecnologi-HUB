import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface EnviarAprobacion { nombre: string; asunto: string; preheader?: string; html: string; audiencia?: string }

@Injectable()
export class MailingService {
  constructor(private readonly prisma: PrismaService) {}

  enviar(marcaId: string, email: string, d: EnviarAprobacion) {
    if (!d?.nombre?.trim() || !d?.asunto?.trim() || !d?.html?.trim()) throw new BadRequestException('Faltan nombre, asunto o contenido');
    if (d.html.length > 1_500_000) throw new BadRequestException('El correo es demasiado grande');
    return this.prisma.mailingAprobacion.create({
      data: { marcaId, nombre: d.nombre.trim(), asunto: d.asunto.trim(), preheader: d.preheader?.trim() || null, html: d.html, audiencia: d.audiencia?.trim() || null, solicitadoPor: email },
      select: { id: true, estado: true },
    });
  }

  /** Admin ve todo; los demás solo lo que enviaron ellos. Sin el HTML (pesado) en la lista. */
  list(marcaId: string, email: string, esAdmin: boolean) {
    return this.prisma.mailingAprobacion.findMany({
      where: { marcaId, ...(esAdmin ? {} : { solicitadoPor: email }) },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: { id: true, nombre: true, asunto: true, audiencia: true, estado: true, nota: true, solicitadoPor: true, revisadoPor: true, revisadoAt: true, createdAt: true },
    });
  }

  async detalle(marcaId: string, id: string, email: string, esAdmin: boolean) {
    const m = await this.prisma.mailingAprobacion.findFirst({ where: { id, marcaId } });
    if (!m || (!esAdmin && m.solicitadoPor !== email)) throw new NotFoundException('No encontrado');
    return m;
  }

  async revisar(marcaId: string, id: string, email: string, estado: 'APROBADO' | 'RECHAZADO', nota?: string) {
    const m = await this.prisma.mailingAprobacion.findFirst({ where: { id, marcaId } });
    if (!m) throw new NotFoundException('No encontrado');
    if (m.estado !== 'PENDIENTE') throw new BadRequestException('Ya fue revisado');
    return this.prisma.mailingAprobacion.update({ where: { id, marcaId }, data: { estado, nota: nota?.trim() || null, revisadoPor: email, revisadoAt: new Date() }, select: { id: true, estado: true } });
  }
}
