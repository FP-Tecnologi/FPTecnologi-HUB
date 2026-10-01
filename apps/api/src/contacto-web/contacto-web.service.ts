import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { normalizarCelular } from '../cotizador/cotizador.service.js';
import type { ActualizarContactoDto, CrearContactoDto } from './contacto-web.dto.js';

// Roles que reciben el aviso de contacto nuevo.
const ROLES_AVISO = ['admin', 'comercial'];

// Tope por IP+marca (endpoint público, throttler global deshabilitado).
const VENTANA_MS = 10 * 60_000;
const MAX_POR_VENTANA = 5;
const intentos = new Map<string, number[]>();

@Injectable()
export class ContactoWebService {
  private readonly logger = new Logger(ContactoWebService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // ------------------------------------------------------------------ público

  async crearPublico(marcaId: string, dto: CrearContactoDto, ip: string) {
    // Honeypot: se responde "ok" sin guardar para no darle pistas al bot.
    if (dto.website) return { ok: true };

    const marca = await this.prisma.marca.findUnique({ where: { id: marcaId } });
    if (!marca) throw new BadRequestException('Marca inválida');

    this.limitar(`${marcaId}:${ip}`);

    // Un teléfono que no es celular (fijo, extranjero) no se descarta: queda en el mensaje.
    const telefono = dto.celular?.trim();
    const celular = telefono ? normalizarCelular(telefono) : null;
    const mensaje = telefono && !celular ? `${dto.mensaje.trim()}

Teléfono: ${telefono}` : dto.mensaje.trim();

    const tipo = dto.tipo ?? 'CONTACTO';
    const contacto = await this.prisma.contactoWeb.create({
      data: {
        marcaId,
        tipo,
        nombre: dto.nombre.trim(),
        email: dto.email.trim().toLowerCase(),
        celular,
        empresa: dto.empresa?.trim() || null,
        mensaje,
        origen: dto.origen?.trim() || null,
      },
    });
    // El aviso no debe tumbar el registro.
    this.avisarEquipo(marcaId, contacto.id, contacto.nombre, tipo, contacto.mensaje).catch((e) =>
      this.logger.error('No se pudo avisar al equipo del contacto nuevo', e as Error),
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
    return this.prisma.contactoWeb.findMany({ where: { marcaId }, orderBy: { createdAt: 'desc' }, take: 1000 });
  }

  async get(marcaId: string, id: string) {
    const contacto = await this.prisma.contactoWeb.findFirst({ where: { id, marcaId } });
    if (!contacto) throw new NotFoundException('Contacto no encontrado');
    return contacto;
  }

  async actualizar(marcaId: string, id: string, dto: ActualizarContactoDto, email: string) {
    await this.get(marcaId, id);
    return this.prisma.contactoWeb.update({
      where: { id, marcaId },
      data: { ...dto, atendidoPor: email },
    });
  }

  async eliminar(marcaId: string, id: string) {
    await this.get(marcaId, id);
    await this.prisma.contactoWeb.delete({ where: { id, marcaId } });
    return { ok: true };
  }

  // ------------------------------------------------------------------ interno

  private async avisarEquipo(marcaId: string, id: string, nombre: string, tipo: string, mensaje: string) {
    const asignaciones = await this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { in: ROLES_AVISO } } },
      include: { usuario: { select: { id: true, email: true, activo: true } } },
    });
    const usuarios = [
      ...new Map(asignaciones.filter((a) => a.usuario.activo).map((a) => [a.usuario.id, a.usuario])).values(),
    ];
    if (usuarios.length === 0) return;
    const etiqueta = tipo === 'RECLAMO' ? 'Nuevo reclamo' : 'Nuevo contacto de la web';
    const url = `${process.env.WEB_ORIGIN ?? 'http://localhost:3000'}/web/contactos?id=${id}`;
    await this.prisma.notificacion.createMany({
      data: usuarios.map((u) => ({
        marcaId,
        usuarioId: u.id,
        tipo: 'SISTEMA' as const,
        titulo: etiqueta,
        mensaje: `${nombre}: ${mensaje}`.slice(0, 140),
      })),
    });
    await Promise.all(usuarios.map((u) => this.mail.sendContactoNuevo(u.email, etiqueta, nombre, mensaje, url)));
  }
}
