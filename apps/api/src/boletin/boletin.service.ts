import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { SuscribirDto } from './boletin.dto.js';

// Tope suave anti-spam por IP+marca (el throttler global está deshabilitado, ver app.module).
const VENTANA_MS = 10 * 60_000;
const MAX_POR_VENTANA = 5;
const intentos = new Map<string, number[]>();

@Injectable()
export class BoletinService {
  constructor(private readonly prisma: PrismaService) {}

  /** Idempotente: suscribir dos veces el mismo correo responde ok sin duplicar. */
  async suscribir(marcaId: string, dto: SuscribirDto, ip: string) {
    if (dto.website) return { ok: true }; // honeypot
    const marca = await this.prisma.marca.findUnique({ where: { id: marcaId } });
    if (!marca) throw new BadRequestException('Marca inválida');
    this.limitar(`${marcaId}:${ip}`);

    const email = dto.email.trim().toLowerCase();
    const existe = await this.prisma.suscriptorBoletin.findFirst({ where: { marcaId, email } });
    if (!existe) {
      await this.prisma.suscriptorBoletin.create({ data: { marcaId, email, origen: dto.origen?.trim() || null } });
    }
    return { ok: true };
  }

  list(marcaId: string) {
    return this.prisma.suscriptorBoletin.findMany({ where: { marcaId }, orderBy: { createdAt: 'desc' }, take: 5000 });
  }

  async eliminar(marcaId: string, id: string) {
    const s = await this.prisma.suscriptorBoletin.findFirst({ where: { id, marcaId } });
    if (!s) throw new NotFoundException('Suscriptor no encontrado');
    await this.prisma.suscriptorBoletin.delete({ where: { id, marcaId } });
    return { ok: true };
  }

  private limitar(clave: string) {
    const ahora = Date.now();
    const recientes = (intentos.get(clave) ?? []).filter((t) => ahora - t < VENTANA_MS);
    if (recientes.length >= MAX_POR_VENTANA) {
      throw new HttpException('Demasiados intentos seguidos. Intenta de nuevo en unos minutos.', HttpStatus.TOO_MANY_REQUESTS);
    }
    recientes.push(ahora);
    intentos.set(clave, recientes);
    if (intentos.size > 5000) for (const [k, v] of intentos) if (!v.some((t) => ahora - t < VENTANA_MS)) intentos.delete(k);
  }
}
