import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import type { ActualizarLeadDto, CrearLeadDto } from './cotizador.dto.js';

// Roles que reciben el aviso de lead nuevo.
const ROLES_AVISO = ['admin', 'comercial'];

// Tope por IP+marca: el endpoint es público y el throttler global está
// deshabilitado (ver app.module). En memoria alcanza para frenar spam básico.
const VENTANA_MS = 10 * 60_000;
const MAX_POR_VENTANA = 5;
const intentos = new Map<string, number[]>();

/** Normaliza un celular peruano a 9 dígitos (quita +51, espacios y guiones); null si no es válido. */
export function normalizarCelular(raw: string): string | null {
  const digits = raw.replace(/[\s()-]/g, '').replace(/^\+?51(?=9\d{8}$)/, '');
  return /^9\d{8}$/.test(digits) ? digits : null;
}

@Injectable()
export class CotizadorService {
  private readonly logger = new Logger(CotizadorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // ------------------------------------------------------------------ público

  async crearPublico(marcaId: string, dto: CrearLeadDto, ip: string) {
    // Honeypot: se responde "ok" sin guardar para no darle pistas al bot.
    if (dto.website) return { ok: true };

    const marca = await this.prisma.marca.findUnique({ where: { id: marcaId } });
    if (!marca) throw new BadRequestException('Marca inválida');

    this.limitar(`${marcaId}:${ip}`);

    const esDni = dto.tipoDocumento === 'DNI';
    if (esDni !== (dto.nroDocumento.length === 8)) {
      throw new BadRequestException(esDni ? 'El DNI debe tener 8 dígitos' : 'El RUC debe tener 11 dígitos');
    }
    if (dto.tipoPersona === 'JURIDICA' && dto.tipoDocumento !== 'RUC') {
      throw new BadRequestException('Una persona jurídica se identifica con RUC');
    }
    const celular = normalizarCelular(dto.celular);
    if (!celular) throw new BadRequestException('Ingresa un celular válido de 9 dígitos');
    if (dto.tipoPersona === 'JURIDICA' && !dto.empresa?.trim()) {
      throw new BadRequestException('Indica el nombre de la empresa');
    }

    const lead = await this.prisma.leadCotizador.create({
      data: {
        marcaId,
        nombres: dto.nombres.trim(),
        apellidos: dto.apellidos.trim(),
        tipoPersona: dto.tipoPersona,
        tipoDocumento: dto.tipoDocumento,
        nroDocumento: dto.nroDocumento,
        empresa: dto.empresa?.trim() || null,
        email: dto.email.trim().toLowerCase(),
        celular,
        interes: dto.interes.trim(),
        mensaje: dto.mensaje?.trim() || null,
        origen: dto.origen?.trim() || null,
      },
    });
    // El aviso no debe tumbar el registro del lead.
    this.avisarEquipo(marcaId, lead.id, `${lead.nombres} ${lead.apellidos}`, lead.interes).catch((e) =>
      this.logger.error('No se pudo avisar al equipo del lead nuevo', e as Error),
    );
    return { ok: true };
  }

  private limitar(clave: string) {
    const ahora = Date.now();
    const recientes = (intentos.get(clave) ?? []).filter((t) => ahora - t < VENTANA_MS);
    if (recientes.length >= MAX_POR_VENTANA) {
      throw new HttpException('Demasiadas solicitudes seguidas. Intenta de nuevo en unos minutos.', HttpStatus.TOO_MANY_REQUESTS);
    }
    recientes.push(ahora);
    intentos.set(clave, recientes);
    if (intentos.size > 5000) for (const [k, v] of intentos) if (!v.some((t) => ahora - t < VENTANA_MS)) intentos.delete(k);
  }

  // ---------------------------------------------------------------- dashboard

  list(marcaId: string) {
    return this.prisma.leadCotizador.findMany({ where: { marcaId }, orderBy: { createdAt: 'desc' }, take: 1000 });
  }

  async get(marcaId: string, id: string) {
    const lead = await this.prisma.leadCotizador.findFirst({ where: { id, marcaId } });
    if (!lead) throw new NotFoundException('Lead no encontrado');
    return lead;
  }

  async actualizar(marcaId: string, id: string, dto: ActualizarLeadDto, email: string) {
    await this.get(marcaId, id);
    return this.prisma.leadCotizador.update({
      where: { id, marcaId },
      data: { ...dto, atendidoPor: email },
    });
  }

  async eliminar(marcaId: string, id: string) {
    await this.get(marcaId, id);
    await this.prisma.leadCotizador.delete({ where: { id, marcaId } });
    return { ok: true };
  }

  // ------------------------------------------------------------------ interno

  private async avisarEquipo(marcaId: string, leadId: string, nombre: string, interes: string) {
    const asignaciones = await this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { in: ROLES_AVISO } } },
      include: { usuario: { select: { id: true, email: true, activo: true } } },
    });
    const usuarios = [
      ...new Map(asignaciones.filter((a) => a.usuario.activo).map((a) => [a.usuario.id, a.usuario])).values(),
    ];
    if (usuarios.length === 0) return;
    const url = `${process.env.WEB_ORIGIN ?? 'http://localhost:3000'}/cotizador/leads?id=${leadId}`;
    await this.prisma.notificacion.createMany({
      data: usuarios.map((u) => ({
        marcaId,
        usuarioId: u.id,
        tipo: 'COTIZACION' as const,
        titulo: 'Nuevo lead del cotizador',
        mensaje: `${nombre} quiere cotizar: ${interes}`.slice(0, 140),
      })),
    });
    await Promise.all(usuarios.map((u) => this.mail.sendLeadNuevo(u.email, nombre, interes, url)));
  }
}
