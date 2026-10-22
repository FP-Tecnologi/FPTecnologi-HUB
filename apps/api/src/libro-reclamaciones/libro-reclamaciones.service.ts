import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import type { HojaCorreo } from '../mail/templates.js';
import type { EstadoHoja } from '../generated/prisma/enums.js';
import type { HojaReclamacion } from '../generated/prisma/client.js';
import { diasHabilesEntre, inicioDiaLima, sumarDiasHabiles } from './dias-habiles.js';
import type { ActualizarHojaDto, CrearHojaDto, ResponderHojaDto } from './libro-reclamaciones.dto.js';

const ROLES_AVISO = ['admin', 'comercial'];
const DIAS_RESPUESTA = 15;
const CAMPOS_BUSQUEDA = ['codigo', 'nombres', 'apellidos', 'nroDocumento', 'email'] as const;

/** Agrega el plazo restante (null si ya se respondió; negativo si venció) y si está vencida. */
export function conPlazo<T extends { estado: string; fechaLimite: Date }>(h: T) {
  const pendiente = h.estado !== 'RESPONDIDO';
  const ahora = new Date();
  return {
    ...h,
    diasHabilesRestantes: pendiente ? diasHabilesEntre(ahora, h.fechaLimite) : null,
    vencida: pendiente && h.fechaLimite < ahora,
  };
}
const VENTANA_MS = 10 * 60_000;
// Topes por marca+IP (el throttler global está deshabilitado). En memoria alcanza para spam básico.
const intentosCrear = new Map<string, number[]>();
const intentosConsulta = new Map<string, number[]>();

function limitar(mapa: Map<string, number[]>, clave: string, max: number) {
  const ahora = Date.now();
  const recientes = (mapa.get(clave) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (recientes.length >= max) {
    throw new HttpException('Demasiadas solicitudes seguidas. Intenta de nuevo en unos minutos.', HttpStatus.TOO_MANY_REQUESTS);
  }
  recientes.push(ahora);
  mapa.set(clave, recientes);
  if (mapa.size > 5000) for (const [k, v] of mapa) if (!v.some((t) => ahora - t < VENTANA_MS)) mapa.delete(k);
}

/** Solo para tests: vacía los topes en memoria. */
export function reiniciarLimitadores() {
  intentosCrear.clear();
  intentosConsulta.clear();
}

const norm = (s: string) => s.trim().toUpperCase();

function validarDocumento(tipo: string, nro: string, etiqueta: string) {
  const ok =
    tipo === 'DNI' ? /^\d{8}$/.test(nro)
    : tipo === 'RUC' ? /^\d{11}$/.test(nro)
    : tipo === 'PASAPORTE' ? /^[A-Za-z0-9]{6,15}$/.test(nro)
    : /^[A-Za-z0-9]{9,12}$/.test(nro); // CE
  if (!ok) {
    throw new BadRequestException(
      tipo === 'DNI' ? `${etiqueta}: el DNI debe tener 8 dígitos`
      : tipo === 'RUC' ? `${etiqueta}: el RUC debe tener 11 dígitos`
      : tipo === 'PASAPORTE' ? `${etiqueta}: el pasaporte debe tener entre 6 y 15 caracteres alfanuméricos`
      : `${etiqueta}: el documento debe tener entre 9 y 12 caracteres alfanuméricos`,
    );
  }
}

@Injectable()
export class LibroReclamacionesService {
  private readonly logger = new Logger(LibroReclamacionesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // ------------------------------------------------------------------ público

  async crearPublico(marcaId: string, dto: CrearHojaDto, ip: string): Promise<{ ok: true; codigo?: string; fecha?: Date; fechaLimite?: Date }> {
    if (dto.website) return { ok: true }; // honeypot

    const marca = await this.prisma.marca.findUnique({ where: { id: marcaId } });
    if (!marca) throw new BadRequestException('Marca inválida');

    validarDocumento(dto.tipoDocumento, dto.nroDocumento, 'Documento');
    if (dto.menorEdad) {
      if (!dto.repNombres?.trim() || !dto.repTipoDocumento || !dto.repNroDocumento) {
        throw new BadRequestException('Indica los datos del padre, madre o representante');
      }
      validarDocumento(dto.repTipoDocumento, dto.repNroDocumento, 'Representante');
    }

    // El tope cuenta solo envíos válidos: los rechazados por validación no lo consumen.
    limitar(intentosCrear, `${marcaId}:${ip}`, 5);

    const fecha = new Date();
    const anio = Number(fecha.toLocaleDateString('en-CA', { timeZone: 'America/Lima' }).slice(0, 4));
    const fechaLimite = sumarDiasHabiles(fecha, DIAS_RESPUESTA);

    let hoja: HojaReclamacion | undefined;
    for (let intento = 1; !hoja; intento++) {
      const { _max } = await this.prisma.hojaReclamacion.aggregate({ _max: { correlativo: true }, where: { marcaId, anio } });
      const correlativo = (_max.correlativo ?? 0) + 1;
      try {
        hoja = await this.prisma.hojaReclamacion.create({
          data: {
            marcaId,
            anio,
            correlativo,
            codigo: `LR-${String(correlativo).padStart(4, '0')}-${anio}`,
            fecha,
            fechaLimite,
            nombres: dto.nombres.trim(),
            apellidos: dto.apellidos.trim(),
            tipoDocumento: dto.tipoDocumento,
            nroDocumento: dto.nroDocumento.trim(),
            domicilio: dto.domicilio.trim(),
            telefono: dto.telefono.trim(),
            email: dto.email.trim().toLowerCase(),
            menorEdad: dto.menorEdad,
            repNombres: dto.menorEdad ? dto.repNombres!.trim() : null,
            repTipoDocumento: dto.menorEdad ? dto.repTipoDocumento! : null,
            repNroDocumento: dto.menorEdad ? dto.repNroDocumento! : null,
            tipoBien: dto.tipoBien,
            montoReclamado: dto.montoReclamado ?? null,
            moneda: dto.moneda,
            descripcionBien: dto.descripcionBien.trim(),
            nroPedido: dto.nroPedido?.trim() || null,
            tipo: dto.tipo,
            detalle: dto.detalle.trim(),
            pedidoConsumidor: dto.pedidoConsumidor.trim(),
            medioRespuesta: dto.medioRespuesta,
            origen: dto.origen?.trim() || null,
          },
        });
      } catch (e) {
        // Colisión de correlativo con otra hoja simultánea: se recalcula.
        if ((e as { code?: string }).code !== 'P2002' || intento >= 3) throw e;
      }
    }

    // Los correos no deben tumbar el registro de la hoja.
    this.notificar(marca, hoja).catch((e) => this.logger.error('No se pudo notificar la hoja de reclamación', e as Error));
    return { ok: true, codigo: hoja.codigo, fecha: hoja.fecha, fechaLimite: hoja.fechaLimite };
  }

  async consultar(marcaId: string, codigo: string, documento: string, ip = 'desconocida') {
    limitar(intentosConsulta, `${marcaId}:${ip}`, 20); // frena la enumeración de códigos
    const hoja = await this.prisma.hojaReclamacion.findFirst({ where: { marcaId, codigo: norm(codigo) } });
    // Mismo mensaje exista o no el código, para no permitir enumerar hojas.
    if (!hoja || norm(hoja.nroDocumento) !== norm(documento)) {
      throw new NotFoundException('No encontramos una hoja con esos datos');
    }
    return {
      codigo: hoja.codigo,
      tipo: hoja.tipo,
      estado: hoja.estado,
      fecha: hoja.fecha,
      fechaLimite: hoja.fechaLimite,
      respuesta: hoja.respuesta,
      respondidoAt: hoja.respondidoAt,
    };
  }

  async proveedor(marcaId: string) {
    const m = await this.prisma.marca.findUnique({ where: { id: marcaId } });
    if (!m) throw new BadRequestException('Marca inválida');
    return { razonSocial: m.razonSocial, ruc: m.ruc, nombreComercial: m.nombre, direccion: m.direccionFiscal, email: m.contactoEmail };
  }

  // ---------------------------------------------------------------- dashboard

  async list(marcaId: string, filtro: { estado?: EstadoHoja; vencidas?: boolean; q?: string } = {}) {
    const q = filtro.q?.trim();
    const hojas = await this.prisma.hojaReclamacion.findMany({
      where: {
        marcaId,
        ...(filtro.estado ? { estado: filtro.estado } : {}),
        ...(filtro.vencidas ? { AND: [{ estado: { not: 'RESPONDIDO' as const } }, { fechaLimite: { lt: new Date() } }] } : {}),
        ...(q ? { OR: CAMPOS_BUSQUEDA.map((c) => ({ [c]: { contains: q, mode: 'insensitive' as const } })) } : {}),
      },
      orderBy: { fecha: 'desc' },
      take: 1000,
    });
    return hojas.map(conPlazo);
  }

  async get(marcaId: string, id: string) {
    const hoja = await this.prisma.hojaReclamacion.findFirst({ where: { id, marcaId } });
    if (!hoja) throw new NotFoundException('Hoja no encontrada');
    return conPlazo(hoja);
  }

  async resumen(marcaId: string) {
    const ahora = new Date();
    const [recibidas, enProceso, respondidas, vencidas, porVencer] = await Promise.all([
      this.prisma.hojaReclamacion.count({ where: { marcaId, estado: 'RECIBIDO' } }),
      this.prisma.hojaReclamacion.count({ where: { marcaId, estado: 'EN_PROCESO' } }),
      this.prisma.hojaReclamacion.count({ where: { marcaId, estado: 'RESPONDIDO' } }),
      this.prisma.hojaReclamacion.count({ where: { marcaId, estado: { not: 'RESPONDIDO' }, fechaLimite: { lt: ahora } } }),
      // Exacto y en BD: tienen ≤3 días hábiles los días anteriores al día que está a 4 hábiles (inicio de ese día en Lima).
      this.prisma.hojaReclamacion.count({
        where: { marcaId, estado: { not: 'RESPONDIDO' }, fechaLimite: { gte: ahora, lt: inicioDiaLima(sumarDiasHabiles(ahora, 4)) } },
      }),
    ]);
    return { recibidas, enProceso, respondidas, vencidas, porVencer };
  }

  async actualizar(marcaId: string, id: string, dto: ActualizarHojaDto, email: string) {
    if (dto.estado !== undefined && dto.estado !== 'RECIBIDO' && dto.estado !== 'EN_PROCESO') {
      throw new BadRequestException('Estado inválido: para responder usa /responder');
    }
    if (dto.notasInternas !== undefined && typeof dto.notasInternas !== 'string') throw new BadRequestException('Notas inválidas');
    if (dto.estado === undefined && dto.notasInternas === undefined) throw new BadRequestException('Nada que actualizar');
    const actual = await this.get(marcaId, id);
    if (actual.estado === 'RESPONDIDO') throw new BadRequestException('Ya fue respondida');
    // Atómico: si la responden entre la lectura y el guardado, no se pisa.
    const { count } = await this.prisma.hojaReclamacion.updateMany({
      where: { id, marcaId, estado: { not: 'RESPONDIDO' } },
      data: {
        ...(dto.estado ? { estado: dto.estado } : {}),
        ...(dto.notasInternas !== undefined ? { notasInternas: dto.notasInternas.trim() || null } : {}),
        atendidoPor: email,
      },
    });
    if (count === 0) throw new BadRequestException('Ya fue respondida');
    return this.get(marcaId, id);
  }

  async responder(marcaId: string, id: string, dto: ResponderHojaDto, email: string) {
    await this.get(marcaId, id);
    const respuesta = dto.respuesta.trim();
    // Atómico: dos respuestas simultáneas no pueden ganar ambas.
    const { count } = await this.prisma.hojaReclamacion.updateMany({
      where: { id, marcaId, estado: { not: 'RESPONDIDO' } },
      data: { estado: 'RESPONDIDO', respuesta, respondidoAt: new Date(), respondidoPor: email, atendidoPor: email },
    });
    if (count === 0) throw new BadRequestException('Ya fue respondida');
    const hoja = await this.get(marcaId, id);
    const prov = await this.proveedor(marcaId);
    await this.mail.sendRespuestaReclamo(hoja.email, {
      codigo: hoja.codigo,
      tipo: hoja.tipo,
      respuesta,
      proveedor: { razonSocial: prov.razonSocial, nombreComercial: prov.nombreComercial },
    });
    return hoja;
  }

  // ------------------------------------------------------------------ interno

  private async notificar(marca: { id: string; nombre: string; razonSocial: string | null; ruc: string | null; direccionFiscal: string | null; contactoEmail: string | null }, h: HojaReclamacion) {
    const datos: HojaCorreo = {
      codigo: h.codigo,
      fecha: h.fecha,
      fechaLimite: h.fechaLimite,
      proveedor: { razonSocial: marca.razonSocial, ruc: marca.ruc, nombreComercial: marca.nombre, direccion: marca.direccionFiscal },
      consumidor: { nombres: h.nombres, apellidos: h.apellidos, tipoDocumento: h.tipoDocumento, nroDocumento: h.nroDocumento, domicilio: h.domicilio, telefono: h.telefono, email: h.email },
      menorEdad: h.menorEdad,
      representante: h.menorEdad && h.repNombres ? { nombres: h.repNombres, tipoDocumento: h.repTipoDocumento ?? '', nroDocumento: h.repNroDocumento ?? '' } : undefined,
      bien: { tipo: h.tipoBien, monto: h.montoReclamado?.toString() ?? null, moneda: h.moneda, descripcion: h.descripcionBien, nroPedido: h.nroPedido },
      tipo: h.tipo,
      detalle: h.detalle,
      pedido: h.pedidoConsumidor,
      medioRespuesta: h.medioRespuesta,
    };
    const res = await Promise.allSettled([this.mail.sendHojaConsumidor(h.email, datos), this.avisarEquipo(h.marcaId, h, datos, marca.contactoEmail)]);
    for (const r of res) if (r.status === 'rejected') this.logger.error('Falló un aviso de la hoja de reclamación', r.reason as Error);
  }

  private async avisarEquipo(marcaId: string, h: HojaReclamacion, datos: HojaCorreo, contactoEmail: string | null) {
    const asignaciones = await this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { in: ROLES_AVISO } } },
      include: { usuario: { select: { id: true, email: true, activo: true } } },
    });
    const usuarios = [...new Map(asignaciones.filter((a) => a.usuario.activo).map((a) => [a.usuario.id, a.usuario])).values()];
    const url = `${process.env.WEB_ORIGIN ?? 'http://localhost:3000'}/libro-reclamaciones?id=${h.id}`;
    if (usuarios.length === 0) {
      // Sin usuarios asignados, la hoja no puede quedar sin aviso dentro del plazo de 15 días hábiles.
      if (contactoEmail) await this.mail.sendHojaEquipo(contactoEmail, datos, url);
      else this.logger.warn(`Hoja ${h.codigo} (marca ${marcaId}) sin destinatarios: no hay usuarios admin/comercial ni contactoEmail`);
      return;
    }
    await this.prisma.notificacion.createMany({
      data: usuarios.map((u) => ({
        marcaId,
        usuarioId: u.id,
        tipo: 'SISTEMA' as const,
        titulo: `Nueva hoja de reclamación ${h.codigo}`,
        mensaje: `${h.nombres} ${h.apellidos}: ${h.detalle}`.slice(0, 140),
      })),
    });
    await Promise.all(usuarios.map((u) => this.mail.sendHojaEquipo(u.email, datos, url)));
  }
}
