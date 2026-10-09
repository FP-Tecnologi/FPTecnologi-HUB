import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { normalizarCelular } from '../cotizador/cotizador.service.js';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto.js';
import { ActualizarCotizacionDto, EnviarCotizacionDto } from './dto/gestion-cotizacion.dto.js';
import { EstadoCotizacion } from '../generated/prisma/enums.js';
import { empresaPdf, pdfCotizacion } from '../common/documento-pdf.js';

// Roles del dashboard que reciben el aviso de cotización nueva.
const ROLES_AVISO = ['admin', 'comercial', 'ventas'];

// Tope por IP+marca (endpoint público, throttler global deshabilitado).
const VENTANA_MS = 10 * 60_000;
const MAX_POR_VENTANA = 5;
const intentos = new Map<string, number[]>();

const MS_DIA = 24 * 60 * 60 * 1000;

const dinero = (monto: unknown, moneda: string) =>
  monto == null ? null : `${moneda} ${Number(monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fechaCorta = (d: Date | null) => (d ? d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : null);

@Injectable()
export class CotizacionesService {
  private readonly logger = new Logger(CotizacionesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // ------------------------------------------------------------------ público

  async create(marcaId: string, dto: CreateCotizacionDto, ip = '') {
    // Honeypot: se responde "ok" sin guardar para no darle pistas al bot.
    if (dto.website) return { ok: true as const, numero: null as string | null };
    this.limitar(`${marcaId}:${ip}`);

    if (!dto.servicioId && !dto.servicioSlug) throw new BadRequestException('Indica el servicio a cotizar');
    const servicio = await this.prisma.servicio.findFirst({
      where: { marcaId, activo: true, ...(dto.servicioId ? { id: dto.servicioId } : { slug: dto.servicioSlug }) },
    });
    if (!servicio) throw new BadRequestException('El servicio no existe o no pertenece a esta marca');

    let telefono: string | null = null;
    if (dto.clienteTelefono?.trim()) {
      telefono = normalizarCelular(dto.clienteTelefono);
      if (!telefono) throw new BadRequestException('Ingresa un celular válido de 9 dígitos');
    }

    let numero = '';
    for (let intento = 0; intento < 3; intento++) {
      numero = `COT-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      try {
        const c = await this.prisma.cotizacion.create({
          data: {
            marcaId,
            numero,
            servicioId: servicio.id,
            clienteNombre: dto.clienteNombre.trim(),
            clienteEmail: dto.clienteEmail.trim().toLowerCase(),
            clienteTelefono: telefono,
            clienteEmpresa: dto.clienteEmpresa?.trim() || null,
            mensaje: dto.mensaje?.trim() || null,
            origen: dto.origen?.trim() || null,
          },
        });
        this.avisarEquipo(marcaId, c.id, c.clienteNombre, servicio.nombre).catch((e) =>
          this.logger.error('No se pudo avisar al equipo de la cotización nueva', e as Error),
        );
        return { ok: true as const, numero };
      } catch (e) {
        // P2002 = chocó el correlativo con otra solicitud simultánea: reintentar.
        if (e && typeof e === 'object' && (e as { code?: string }).code === 'P2002' && intento < 2) continue;
        throw e;
      }
    }
    throw new BadRequestException('No se pudo registrar la solicitud');
  }

  // ---------------------------------------------------------------- dashboard

  findAll(marcaId: string) {
    return this.prisma.cotizacion.findMany({
      where: { marcaId },
      include: { servicio: { select: { id: true, nombre: true, slug: true } }, _count: { select: { envios: true } } },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });
  }

  async findOne(marcaId: string, id: string) {
    const cotizacion = await this.prisma.cotizacion.findFirst({
      where: { id, marcaId },
      include: { servicio: { select: { id: true, nombre: true, slug: true } }, envios: { orderBy: { createdAt: 'desc' } } },
    });
    if (!cotizacion) throw new NotFoundException('Cotización no encontrada');
    return cotizacion;
  }

  async actualizar(marcaId: string, id: string, dto: ActualizarCotizacionDto, email: string) {
    await this.findOne(marcaId, id);
    const data: Record<string, unknown> = { atendidoPor: email };
    if (dto.estado !== undefined) data.estado = dto.estado;
    if (dto.propuesta !== undefined) data.propuesta = dto.propuesta.trim() || null;
    if (dto.monto !== undefined) data.monto = dto.monto;
    if (dto.moneda !== undefined) data.moneda = dto.moneda;
    if (dto.notas !== undefined) data.notas = dto.notas.trim() || null;
    if (dto.validezDias !== undefined) data.validezHasta = dto.validezDias === 0 ? null : new Date(Date.now() + dto.validezDias * MS_DIA);
    await this.prisma.cotizacion.updateMany({ where: { id, marcaId }, data });
    return this.findOne(marcaId, id);
  }

  async eliminar(marcaId: string, id: string) {
    await this.findOne(marcaId, id);
    await this.prisma.cotizacionEnvio.deleteMany({ where: { marcaId, cotizacionId: id } });
    await this.prisma.cotizacion.deleteMany({ where: { id, marcaId } });
    return { eliminada: true };
  }

  /**
   * Envía la cotización al cliente. EMAIL: sale por correo desde el servidor (si falla se informa).
   * WHATSAPP: no hay API; se devuelve el enlace `wa.me` con el mensaje armado para que el asesor lo abra.
   * En ambos casos queda en el historial y la cotización pasa a ENVIADA.
   */
  async enviar(marcaId: string, id: string, dto: EnviarCotizacionDto, enviadoPor: string) {
    const c = await this.findOne(marcaId, id);
    if (!c.propuesta?.trim() && c.monto == null) {
      throw new BadRequestException('Completa la propuesta o el monto antes de enviar la cotización');
    }
    const monto = dinero(c.monto, c.moneda);
    const validez = fechaCorta(c.validezHasta);
    let destinatario: string;
    let mensaje: string;
    let url: string | null = null;

    if (dto.canal === 'EMAIL') {
      destinatario = c.clienteEmail;
      mensaje = c.propuesta ?? '';
      try {
        // El PDF es un extra: si falla, el correo sale igual con la propuesta en el cuerpo.
        const adjunto = await empresaPdf(this.prisma, marcaId)
          .then((e) => pdfCotizacion(e, c))
          .then((content) => [{ filename: `cotizacion-${c.numero ?? c.id.slice(0, 8)}.pdf`, content }])
          .catch((e) => { this.logger.error(`No se pudo generar el PDF de la cotización ${c.numero}`, e as Error); return undefined; });
        await this.mail.sendCotizacionServicio(destinatario, {
          numero: c.numero ?? c.id.slice(0, 8),
          cliente: c.clienteNombre,
          servicio: c.servicio.nombre,
          propuesta: c.propuesta,
          monto,
          validezHasta: validez,
          mensajeExtra: dto.mensaje,
        }, adjunto);
      } catch (e) {
        this.logger.error(`No se pudo enviar la cotización ${c.numero} a ${destinatario}`, e as Error);
        throw new HttpException('No se pudo enviar el correo. Revisa la configuración de correo e intenta de nuevo.', HttpStatus.BAD_GATEWAY);
      }
    } else {
      if (!c.clienteTelefono) throw new BadRequestException('El cliente no dejó un celular: envíala por correo');
      destinatario = c.clienteTelefono;
      mensaje = [
        dto.mensaje?.trim(),
        `Hola ${c.clienteNombre}, te compartimos tu cotización ${c.numero ?? ''} de *${c.servicio.nombre}* (FPTecnologi).`,
        c.propuesta?.trim(),
        monto ? `Inversión: ${monto}` : '',
        validez ? `Válida hasta: ${validez}` : '',
        'Si quieres avanzar o ajustar algo, respóndenos por aquí.',
      ]
        .filter(Boolean)
        .join('\n\n');
      url = `https://wa.me/51${destinatario}?text=${encodeURIComponent(mensaje)}`;
    }

    await this.prisma.cotizacionEnvio.create({
      data: { marcaId, cotizacionId: id, canal: dto.canal, destinatario, mensaje, enviadoPor },
    });
    const avanza: EstadoCotizacion[] = ['PENDIENTE', 'EN_REVISION'];
    await this.prisma.cotizacion.updateMany({
      where: { id, marcaId },
      data: { enviadaAt: new Date(), atendidoPor: enviadoPor, ...(avanza.includes(c.estado) ? { estado: 'ENVIADA' as const } : {}) },
    });
    return { ok: true as const, canal: dto.canal, destinatario, url };
  }

  // ------------------------------------------------------------------ interno

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

  private async avisarEquipo(marcaId: string, cotizacionId: string, cliente: string, servicio: string) {
    const asignaciones = await this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { in: ROLES_AVISO } } },
      include: { usuario: { select: { id: true, email: true, activo: true } } },
    });
    const usuarios = [...new Map(asignaciones.filter((a) => a.usuario.activo).map((a) => [a.usuario.id, a.usuario])).values()];
    if (usuarios.length === 0) return;
    const url = `${process.env.WEB_ORIGIN ?? 'http://localhost:3000'}/soluciones/cotizaciones?id=${cotizacionId}`;
    await this.prisma.notificacion.createMany({
      data: usuarios.map((u) => ({
        marcaId,
        usuarioId: u.id,
        tipo: 'COTIZACION' as const,
        titulo: 'Nueva solicitud de cotización',
        mensaje: `${cliente} pidió cotizar: ${servicio}`.slice(0, 140),
      })),
    });
    await Promise.all(usuarios.map((u) => this.mail.sendLeadNuevo(u.email, cliente, servicio, url)));
  }
}
