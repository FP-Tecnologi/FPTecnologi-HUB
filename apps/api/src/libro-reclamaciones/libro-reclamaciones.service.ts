import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import type { HojaCorreo } from '../mail/templates.js';
import type { EstadoHoja } from '../generated/prisma/enums.js';
import type { HojaReclamacion } from '../generated/prisma/client.js';
import { sumarDiasHabiles } from './dias-habiles.js';
import type { CrearHojaDto, ResponderHojaDto } from './libro-reclamaciones.dto.js';

const ROLES_AVISO = ['admin', 'comercial'];
const DIAS_RESPUESTA = 15;
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

const norm = (s: string) => s.trim().toUpperCase();

function validarDocumento(tipo: string, nro: string, etiqueta: string) {
  const ok =
    tipo === 'DNI' ? /^\d{8}$/.test(nro)
    : tipo === 'RUC' ? /^\d{11}$/.test(nro)
    : /^[A-Za-z0-9]{9,12}$/.test(nro); // CE / PASAPORTE
  if (!ok) {
    throw new BadRequestException(
      tipo === 'DNI' ? `${etiqueta}: el DNI debe tener 8 dígitos`
      : tipo === 'RUC' ? `${etiqueta}: el RUC debe tener 11 dígitos`
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

    limitar(intentosCrear, `${marcaId}:${ip}`, 5);

    validarDocumento(dto.tipoDocumento, dto.nroDocumento, 'Documento');
    if (dto.menorEdad) {
      if (!dto.repNombres?.trim() || !dto.repTipoDocumento || !dto.repNroDocumento) {
        throw new BadRequestException('Indica los datos del padre, madre o representante');
      }
      validarDocumento(dto.repTipoDocumento, dto.repNroDocumento, 'Representante');
    }

    const anio = new Date().getFullYear();
    const fecha = new Date();
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

  list(marcaId: string, filtro: { estado?: EstadoHoja; vencidas?: boolean } = {}) {
    return this.prisma.hojaReclamacion.findMany({
      where: {
        marcaId,
        ...(filtro.estado ? { estado: filtro.estado } : {}),
        ...(filtro.vencidas ? { estado: { not: 'RESPONDIDO' as const }, fechaLimite: { lt: new Date() } } : {}),
      },
      orderBy: { fecha: 'desc' },
      take: 1000,
    });
  }

  async get(marcaId: string, id: string) {
    const hoja = await this.prisma.hojaReclamacion.findFirst({ where: { id, marcaId } });
    if (!hoja) throw new NotFoundException('Hoja no encontrada');
    return hoja;
  }

  async responder(marcaId: string, id: string, dto: ResponderHojaDto, email: string) {
    const hoja = await this.get(marcaId, id);
    if (hoja.estado === 'RESPONDIDO') throw new BadRequestException('Ya fue respondida');
    const actualizada = await this.prisma.hojaReclamacion.update({
      where: { id, marcaId },
      data: { estado: 'RESPONDIDO', respuesta: dto.respuesta.trim(), respondidoAt: new Date(), respondidoPor: email },
    });
    const prov = await this.proveedor(marcaId);
    await this.mail.sendRespuestaReclamo(hoja.email, {
      codigo: hoja.codigo,
      tipo: hoja.tipo,
      respuesta: dto.respuesta.trim(),
      proveedor: { razonSocial: prov.razonSocial, nombreComercial: prov.nombreComercial },
    });
    return actualizada;
  }

  // ------------------------------------------------------------------ interno

  private async notificar(marca: { id: string; nombre: string; razonSocial: string | null; ruc: string | null; direccionFiscal: string | null }, h: HojaReclamacion) {
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
    await Promise.allSettled([this.mail.sendHojaConsumidor(h.email, datos), this.avisarEquipo(h.marcaId, h, datos)]);
  }

  private async avisarEquipo(marcaId: string, h: HojaReclamacion, datos: HojaCorreo) {
    const asignaciones = await this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { in: ROLES_AVISO } } },
      include: { usuario: { select: { id: true, email: true, activo: true } } },
    });
    const usuarios = [...new Map(asignaciones.filter((a) => a.usuario.activo).map((a) => [a.usuario.id, a.usuario])).values()];
    if (usuarios.length === 0) return;
    const url = `${process.env.WEB_ORIGIN ?? 'http://localhost:3000'}/libro-reclamaciones?id=${h.id}`;
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
