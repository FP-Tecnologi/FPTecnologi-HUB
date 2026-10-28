import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { EtapaOportunidad, OrigenOportunidad, Prisma, TipoActividadCrm } from '../generated/prisma/client.js';
import type {
  ActividadDto, ActualizarActividadDto, ActualizarOportunidadDto, CambiarEtapaDto, ContactoDto, CrearOportunidadDto, EmpresaDto, FiltrosOportunidades,
} from './crm.dto.js';

/** Roles que trabajan el CRM de una marca (y a quienes se puede asignar una oportunidad). */
export const ROLES_CRM = ['admin', 'comercial'];
export const ETAPAS_ABIERTAS: EtapaOportunidad[] = ['NUEVO', 'CONTACTADO', 'PROPUESTA', 'NEGOCIACION'];
/** Probabilidad por defecto de cada etapa (para el pipeline ponderado). */
export const PROBABILIDAD: Record<EtapaOportunidad, number> = { NUEVO: 10, CONTACTADO: 25, PROPUESTA: 50, NEGOCIACION: 75, GANADO: 100, PERDIDO: 0 };
const ETAPA_TXT: Record<EtapaOportunidad, string> = { NUEVO: 'Nuevo', CONTACTADO: 'Contactado', PROPUESTA: 'Propuesta enviada', NEGOCIACION: 'Negociación', GANADO: 'Ganado', PERDIDO: 'Perdido' };
const ORIGEN_TXT: Record<OrigenOportunidad, string> = { MANUAL: 'registro manual', COTIZADOR: 'cotizador web', COTIZACION: 'cotización de servicio', CONTACTO_WEB: 'formulario de contacto', PRESUPUESTO: 'presupuesto mayorista' };

/** Lo que una solicitud de la web aporta al CRM (ver registrarSolicitud). */
export interface Solicitud {
  origen: Exclude<OrigenOportunidad, 'MANUAL'>;
  origenId: string;
  nombre: string;
  email?: string | null;
  celular?: string | null;
  documento?: string | null;
  empresa?: string | null;
  ruc?: string | null;
  titulo: string;
  detalle?: string | null;
  monto?: number | null;
  moneda?: string | null;
}

const esP2002 = (e: unknown) => !!e && typeof e === 'object' && (e as { code?: string }).code === 'P2002';
const numeroOpp = () => `OPP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const limpio = (v: string | null | undefined) => v?.trim() || null;
const rucValido = (v: string | null | undefined) => (v && /^(10|15|16|17|20)\d{9}$/.test(v.trim()) ? v.trim() : null);
const n = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));

const INCLUDE_LISTA = {
  empresa: { select: { id: true, razonSocial: true, ruc: true } },
  contacto: { select: { id: true, nombre: true, email: true, celular: true } },
  asignado: { select: { id: true, nombre: true, email: true } },
  _count: { select: { actividades: true } },
} satisfies Prisma.CrmOportunidadInclude;

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ------------------------------------------------------- entrada automática

  /**
   * Una solicitud de la web (lead del cotizador, cotización, contacto, presupuesto) entra al CRM sin duplicar datos:
   * reutiliza el contacto por correo y la empresa por RUC (o por nombre); si ese contacto ya tiene una oportunidad
   * abierta, la solicitud se suma a su historial; si no, abre una oportunidad en «Nuevo». Queda enlazada al registro
   * original (`origen` + `origenId`). Nunca lanza: el formulario público no debe fallar por el CRM.
   */
  async registrarSolicitud(marcaId: string, s: Solicitud): Promise<{ oportunidadId: string; nueva: boolean } | null> {
    try {
      const empresaId = await this.empresaDeSolicitud(marcaId, s);
      const contactoId = await this.contactoDeSolicitud(marcaId, s, empresaId);
      const texto = [`Nueva solicitud desde ${ORIGEN_TXT[s.origen]}: ${s.titulo}`, limpio(s.detalle)].filter(Boolean).join('\n\n').slice(0, 4000);
      const abierta = await this.prisma.crmOportunidad.findFirst({
        where: { marcaId, contactoId, etapa: { in: ETAPAS_ABIERTAS } },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, empresaId: true },
      });
      if (abierta) {
        await this.prisma.crmActividad.create({ data: { marcaId, oportunidadId: abierta.id, tipo: 'SOLICITUD', texto, origen: s.origen, origenId: s.origenId } });
        await this.prisma.crmOportunidad.update({ where: { id: abierta.id, marcaId }, data: { updatedAt: new Date(), ...(!abierta.empresaId && empresaId ? { empresaId } : {}) } });
        return { oportunidadId: abierta.id, nueva: false };
      }
      const opp = await this.crearConNumero(marcaId, {
        titulo: s.titulo.slice(0, 160),
        empresaId,
        contactoId,
        monto: s.monto ?? null,
        moneda: s.moneda ?? 'PEN',
        origen: s.origen,
        origenId: s.origenId,
      });
      await this.prisma.crmActividad.create({ data: { marcaId, oportunidadId: opp.id, tipo: 'SOLICITUD', texto, origen: s.origen, origenId: s.origenId } });
      return { oportunidadId: opp.id, nueva: true };
    } catch (e) {
      this.logger.error(`No se pudo registrar en el CRM la solicitud ${s.origen} ${s.origenId}`, e as Error);
      return null;
    }
  }

  private async empresaDeSolicitud(marcaId: string, s: Solicitud): Promise<string | null> {
    const ruc = rucValido(s.ruc);
    const nombre = limpio(s.empresa);
    if (!ruc && !nombre) return null;
    const existente = await this.prisma.crmEmpresa.findFirst({
      where: ruc ? { marcaId, ruc } : { marcaId, razonSocial: { equals: nombre!, mode: 'insensitive' } },
      select: { id: true },
    });
    if (existente) return existente.id;
    try {
      return (await this.prisma.crmEmpresa.create({ data: { marcaId, razonSocial: (nombre ?? s.nombre).slice(0, 160), ruc } })).id;
    } catch (e) {
      if (esP2002(e) && ruc) return (await this.prisma.crmEmpresa.findFirst({ where: { marcaId, ruc }, select: { id: true } }))?.id ?? null;
      throw e;
    }
  }

  private async contactoDeSolicitud(marcaId: string, s: Solicitud, empresaId: string | null): Promise<string> {
    const email = limpio(s.email)?.toLowerCase() ?? null;
    if (email) {
      const c = await this.prisma.crmContacto.findFirst({ where: { marcaId, email } });
      if (c) {
        // Completa lo que falte, sin pisar lo que el equipo ya corrigió a mano.
        const data = {
          ...(!c.celular && s.celular ? { celular: s.celular } : {}),
          ...(!c.documento && s.documento ? { documento: s.documento } : {}),
          ...(!c.empresaId && empresaId ? { empresaId } : {}),
        };
        if (Object.keys(data).length) await this.prisma.crmContacto.update({ where: { id: c.id, marcaId }, data });
        return c.id;
      }
    }
    const data = { marcaId, nombre: s.nombre.trim().slice(0, 160), email, celular: limpio(s.celular), documento: limpio(s.documento), empresaId };
    try {
      return (await this.prisma.crmContacto.create({ data })).id;
    } catch (e) {
      if (esP2002(e) && email) return (await this.prisma.crmContacto.findFirst({ where: { marcaId, email }, select: { id: true } }))!.id;
      throw e;
    }
  }

  private async crearConNumero(marcaId: string, data: Omit<Prisma.CrmOportunidadUncheckedCreateInput, 'marcaId' | 'numero'>) {
    for (let intento = 0; ; intento++) {
      try {
        return await this.prisma.crmOportunidad.create({ data: { ...data, marcaId, numero: numeroOpp() } });
      } catch (e) {
        if (esP2002(e) && intento < 2) continue;
        throw e;
      }
    }
  }

  // ----------------------------------------------------------- oportunidades

  async asignables(marcaId: string) {
    const filas = await this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { in: ROLES_CRM } }, usuario: { activo: true } },
      select: { rol: { select: { nombre: true } }, usuario: { select: { id: true, nombre: true, email: true } } },
    });
    return filas.map((f) => ({ ...f.usuario, rol: f.rol.nombre })).sort((a, b) => (a.nombre ?? a.email).localeCompare(b.nombre ?? b.email));
  }

  private async validarAsignado(marcaId: string, asignadoId: string | null | undefined) {
    if (!asignadoId) return;
    const ok = await this.prisma.usuarioMarcaRol.count({ where: { marcaId, usuarioId: asignadoId, rol: { nombre: { in: ROLES_CRM } } } });
    if (!ok) throw new BadRequestException('El responsable debe ser un comercial o administrador de esta marca');
  }

  private async validarRelaciones(marcaId: string, empresaId?: string | null, contactoId?: string | null) {
    if (empresaId && !(await this.prisma.crmEmpresa.count({ where: { id: empresaId, marcaId } }))) throw new BadRequestException('La empresa no existe en esta marca');
    if (contactoId && !(await this.prisma.crmContacto.count({ where: { id: contactoId, marcaId } }))) throw new BadRequestException('El contacto no existe en esta marca');
  }

  listar(marcaId: string, f: FiltrosOportunidades, usuarioId: string) {
    const q = f.q?.trim();
    const where: Prisma.CrmOportunidadWhereInput = {
      marcaId,
      ...(f.etapa ? { etapa: f.etapa } : f.estado === 'abiertas' ? { etapa: { in: ETAPAS_ABIERTAS } } : f.estado === 'cerradas' ? { etapa: { in: ['GANADO', 'PERDIDO'] } } : {}),
      ...(f.asignado === 'yo' ? { asignadoId: usuarioId } : f.asignado === 'sin' ? { asignadoId: null } : f.asignado ? { asignadoId: f.asignado } : {}),
      ...(f.origen ? { origen: f.origen } : {}),
      ...(q
        ? { OR: [
            { titulo: { contains: q, mode: 'insensitive' } },
            { numero: { contains: q, mode: 'insensitive' } },
            { empresa: { razonSocial: { contains: q, mode: 'insensitive' } } },
            { contacto: { nombre: { contains: q, mode: 'insensitive' } } },
            { contacto: { email: { contains: q, mode: 'insensitive' } } },
          ] }
        : {}),
    };
    return this.prisma.crmOportunidad.findMany({ where, include: INCLUDE_LISTA, orderBy: { updatedAt: 'desc' }, take: 500 });
  }

  async obtener(marcaId: string, id: string) {
    const o = await this.prisma.crmOportunidad.findFirst({
      where: { id, marcaId },
      include: {
        ...INCLUDE_LISTA,
        empresa: true,
        contacto: true,
        actividades: { where: { marcaId }, orderBy: [{ fecha: 'desc' }, { createdAt: 'desc' }] },
      },
    });
    if (!o) throw new NotFoundException('Oportunidad no encontrada');
    return { ...o, solicitud: await this.solicitudOriginal(marcaId, o.origen, o.origenId) };
  }

  /** Resumen del registro que originó la oportunidad, para «Ver solicitud original» (null si es manual o se borró). */
  async solicitudOriginal(marcaId: string, origen: OrigenOportunidad, origenId: string | null) {
    if (!origenId || origen === 'MANUAL') return null;
    if (origen === 'COTIZADOR') {
      const l = await this.prisma.leadCotizador.findFirst({ where: { id: origenId, marcaId }, select: { interes: true, estado: true, mensaje: true, createdAt: true } });
      return l && { origen, titulo: `Lead del cotizador: ${l.interes}`, estado: l.estado, detalle: l.mensaje, createdAt: l.createdAt, modulo: 'cotizador.leads' };
    }
    if (origen === 'COTIZACION') {
      const c = await this.prisma.cotizacion.findFirst({ where: { id: origenId, marcaId }, select: { numero: true, estado: true, mensaje: true, createdAt: true, servicio: { select: { nombre: true } } } });
      return c && { origen, titulo: `Cotización ${c.numero ?? ''} · ${c.servicio.nombre}`.trim(), estado: c.estado, detalle: c.mensaje, createdAt: c.createdAt, modulo: 'soluciones.cotizaciones' };
    }
    if (origen === 'CONTACTO_WEB') {
      const c = await this.prisma.contactoWeb.findFirst({ where: { id: origenId, marcaId }, select: { estado: true, mensaje: true, createdAt: true } });
      return c && { origen, titulo: 'Formulario de contacto', estado: c.estado, detalle: c.mensaje, createdAt: c.createdAt, modulo: 'web.contactos' };
    }
    const p = await this.prisma.presupuesto.findFirst({ where: { id: origenId, marcaId }, select: { numero: true, estado: true, total: true, moneda: true, createdAt: true } });
    return p && { origen, titulo: `Presupuesto ${p.numero}`, estado: p.estado, detalle: `Total ${p.moneda} ${Number(p.total).toFixed(2)}`, createdAt: p.createdAt, modulo: 'ecommerce.presupuestos' };
  }

  /** ¿Qué oportunidad tiene esta solicitud? (la abrió o se sumó a su historial). Para «Ver en CRM» en las bandejas. */
  async porOrigen(marcaId: string, origen: OrigenOportunidad, origenId: string) {
    const directa = await this.prisma.crmOportunidad.findFirst({ where: { marcaId, origen, origenId }, select: { id: true, numero: true, etapa: true } });
    if (directa) return directa;
    const act = await this.prisma.crmActividad.findFirst({ where: { marcaId, origen, origenId }, select: { oportunidad: { select: { id: true, numero: true, etapa: true } } } });
    return act?.oportunidad ?? null;
  }

  async crear(marcaId: string, dto: CrearOportunidadDto, email: string) {
    await this.validarAsignado(marcaId, dto.asignadoId);
    await this.validarRelaciones(marcaId, dto.empresaId, dto.contactoId);
    // Un RUC o correo que ya está en el CRM reutiliza ese cliente: un mismo cliente puede tener varias oportunidades.
    let empresaId = dto.empresaId ?? null;
    const ruc = rucValido(dto.empresaNueva?.ruc);
    if (!empresaId && ruc) empresaId = (await this.prisma.crmEmpresa.findFirst({ where: { marcaId, ruc }, select: { id: true } }))?.id ?? null;
    if (!empresaId && (dto.empresaNueva?.razonSocial || dto.empresaNueva?.ruc)) {
      empresaId = (await this.crearEmpresa(marcaId, { razonSocial: dto.empresaNueva.razonSocial ?? dto.empresaNueva.ruc!, ruc: dto.empresaNueva.ruc })).id;
    }
    let contactoId = dto.contactoId ?? null;
    const correo = limpio(dto.contactoNuevo?.email)?.toLowerCase();
    if (!contactoId && correo) contactoId = (await this.prisma.crmContacto.findFirst({ where: { marcaId, email: correo }, select: { id: true } }))?.id ?? null;
    if (!contactoId && dto.contactoNuevo?.nombre) contactoId = (await this.crearContacto(marcaId, { ...dto.contactoNuevo, empresaId })).id;
    const etapa = dto.etapa ?? 'NUEVO';
    const o = await this.crearConNumero(marcaId, {
      titulo: dto.titulo.trim(),
      empresaId,
      contactoId,
      etapa,
      monto: dto.monto ?? null,
      moneda: dto.moneda ?? 'PEN',
      probabilidad: dto.probabilidad ?? null,
      cierreEstimado: dto.cierreEstimado ? new Date(dto.cierreEstimado) : null,
      asignadoId: dto.asignadoId ?? null,
      proximaAccion: limpio(dto.proximaAccion),
      proximaAccionAt: dto.proximaAccionAt ? new Date(dto.proximaAccionAt) : null,
      origen: 'MANUAL',
      creadoPor: email,
      ...(etapa === 'GANADO' ? { ganadoAt: new Date(), cerradoAt: new Date() } : {}),
    });
    await this.prisma.crmActividad.create({ data: { marcaId, oportunidadId: o.id, tipo: 'NOTA', texto: `Oportunidad creada por ${email}.`, autor: email } });
    return this.obtener(marcaId, o.id);
  }

  async actualizar(marcaId: string, id: string, dto: ActualizarOportunidadDto, email: string) {
    const o = await this.prisma.crmOportunidad.findFirst({ where: { id, marcaId }, include: { asignado: { select: { nombre: true, email: true } } } });
    if (!o) throw new NotFoundException('Oportunidad no encontrada');
    if (dto.asignadoId !== undefined) await this.validarAsignado(marcaId, dto.asignadoId);
    await this.validarRelaciones(marcaId, dto.empresaId, dto.contactoId);
    const fecha = (v: string | null | undefined) => (v === undefined ? undefined : v ? new Date(v) : null);
    await this.prisma.crmOportunidad.update({
      where: { id, marcaId },
      data: {
        titulo: dto.titulo?.trim(),
        empresaId: dto.empresaId,
        contactoId: dto.contactoId,
        monto: dto.monto,
        moneda: dto.moneda,
        probabilidad: dto.probabilidad,
        cierreEstimado: fecha(dto.cierreEstimado),
        asignadoId: dto.asignadoId,
        proximaAccion: dto.proximaAccion === undefined ? undefined : limpio(dto.proximaAccion),
        proximaAccionAt: fecha(dto.proximaAccionAt),
      },
    });
    if (dto.asignadoId !== undefined && dto.asignadoId !== o.asignadoId) {
      const nuevo = dto.asignadoId ? (await this.asignables(marcaId)).find((u) => u.id === dto.asignadoId) : null;
      await this.prisma.crmActividad.create({ data: { marcaId, oportunidadId: id, tipo: 'NOTA', texto: nuevo ? `Asignada a ${nuevo.nombre ?? nuevo.email}.` : 'Quedó sin responsable.', autor: email } });
    }
    return this.obtener(marcaId, id);
  }

  async cambiarEtapa(marcaId: string, id: string, dto: CambiarEtapaDto, email: string) {
    const o = await this.prisma.crmOportunidad.findFirst({ where: { id, marcaId }, select: { etapa: true } });
    if (!o) throw new NotFoundException('Oportunidad no encontrada');
    if (o.etapa === dto.etapa) return this.obtener(marcaId, id);
    const motivo = limpio(dto.motivoPerdida);
    if (dto.etapa === 'PERDIDO' && !motivo) throw new BadRequestException('Indica el motivo de la pérdida');
    const ahora = new Date();
    const cerrada = dto.etapa === 'GANADO' || dto.etapa === 'PERDIDO';
    await this.prisma.crmOportunidad.update({
      where: { id, marcaId },
      data: {
        etapa: dto.etapa,
        ganadoAt: dto.etapa === 'GANADO' ? ahora : null,
        cerradoAt: cerrada ? ahora : null,
        motivoPerdida: dto.etapa === 'PERDIDO' ? motivo : null,
        ...(dto.monto !== undefined ? { monto: dto.monto } : {}),
      },
    });
    const texto = `${ETAPA_TXT[o.etapa]} → ${ETAPA_TXT[dto.etapa]}${motivo && dto.etapa === 'PERDIDO' ? `. Motivo: ${motivo}` : ''}`;
    await this.prisma.crmActividad.create({ data: { marcaId, oportunidadId: id, tipo: 'ETAPA', texto, autor: email } });
    return this.obtener(marcaId, id);
  }

  async eliminar(marcaId: string, id: string) {
    if (!(await this.prisma.crmOportunidad.count({ where: { id, marcaId } }))) throw new NotFoundException('Oportunidad no encontrada');
    await this.prisma.crmOportunidad.delete({ where: { id, marcaId } });
    return { ok: true as const };
  }

  // -------------------------------------------------------------- actividades

  async agregarActividad(marcaId: string, oportunidadId: string, dto: ActividadDto, email: string) {
    if (!(await this.prisma.crmOportunidad.count({ where: { id: oportunidadId, marcaId } }))) throw new NotFoundException('Oportunidad no encontrada');
    const tarea = dto.tipo === 'TAREA';
    await this.prisma.crmActividad.create({
      data: { marcaId, oportunidadId, tipo: dto.tipo as TipoActividadCrm, texto: dto.texto.trim(), fecha: dto.fecha ? new Date(dto.fecha) : new Date(), hecha: tarea ? !!dto.hecha : true, autor: email },
    });
    await this.prisma.crmOportunidad.update({ where: { id: oportunidadId, marcaId }, data: { updatedAt: new Date() } });
    return this.obtener(marcaId, oportunidadId);
  }

  async actualizarActividad(marcaId: string, id: string, dto: ActualizarActividadDto) {
    const a = await this.prisma.crmActividad.findFirst({ where: { id, marcaId }, select: { oportunidadId: true, tipo: true } });
    if (!a) throw new NotFoundException('Actividad no encontrada');
    if (a.tipo === 'ETAPA' || a.tipo === 'SOLICITUD') throw new BadRequestException('Los registros automáticos no se editan');
    await this.prisma.crmActividad.update({ where: { id, marcaId }, data: { hecha: dto.hecha, texto: dto.texto?.trim(), fecha: dto.fecha ? new Date(dto.fecha) : undefined } });
    return this.obtener(marcaId, a.oportunidadId);
  }

  async eliminarActividad(marcaId: string, id: string) {
    const a = await this.prisma.crmActividad.findFirst({ where: { id, marcaId }, select: { oportunidadId: true, tipo: true } });
    if (!a) throw new NotFoundException('Actividad no encontrada');
    if (a.tipo === 'ETAPA' || a.tipo === 'SOLICITUD') throw new BadRequestException('Los registros automáticos no se borran');
    await this.prisma.crmActividad.delete({ where: { id, marcaId } });
    return this.obtener(marcaId, a.oportunidadId);
  }

  /** Tareas pendientes y próximas acciones de las oportunidades abiertas (de todos o solo mías). */
  async agenda(marcaId: string, usuarioId: string, soloMias: boolean) {
    const deQuien = soloMias ? { asignadoId: usuarioId } : {};
    const [tareas, acciones] = await Promise.all([
      this.prisma.crmActividad.findMany({
        where: { marcaId, tipo: 'TAREA', hecha: false, oportunidad: { marcaId, etapa: { in: ETAPAS_ABIERTAS }, ...deQuien } },
        orderBy: { fecha: 'asc' },
        take: 200,
        include: { oportunidad: { select: { id: true, numero: true, titulo: true, etapa: true, asignado: { select: { nombre: true, email: true } }, contacto: { select: { nombre: true } } } } },
      }),
      this.prisma.crmOportunidad.findMany({
        where: { marcaId, etapa: { in: ETAPAS_ABIERTAS }, proximaAccionAt: { not: null }, ...deQuien },
        orderBy: { proximaAccionAt: 'asc' },
        take: 200,
        include: INCLUDE_LISTA,
      }),
    ]);
    return { tareas, acciones };
  }

  // ------------------------------------------------------- empresas/contactos

  listarEmpresas(marcaId: string, q?: string) {
    const t = q?.trim();
    return this.prisma.crmEmpresa.findMany({
      where: { marcaId, ...(t ? { OR: [{ razonSocial: { contains: t, mode: 'insensitive' } }, { ruc: { contains: t } }] } : {}) },
      include: { _count: { select: { contactos: true, oportunidades: true } } },
      orderBy: { razonSocial: 'asc' },
      take: 500,
    });
  }

  async crearEmpresa(marcaId: string, dto: EmpresaDto) {
    const ruc = limpio(dto.ruc);
    if (ruc && !rucValido(ruc)) throw new BadRequestException('El RUC debe tener 11 dígitos (empieza con 10, 15, 16, 17 o 20)');
    try {
      return await this.prisma.crmEmpresa.create({ data: { marcaId, razonSocial: dto.razonSocial.trim(), ruc, rubro: limpio(dto.rubro), web: limpio(dto.web), telefono: limpio(dto.telefono), direccion: limpio(dto.direccion), notas: limpio(dto.notas) } });
    } catch (e) {
      if (esP2002(e)) throw new BadRequestException('Ya existe una empresa con ese RUC en esta marca');
      throw e;
    }
  }

  async actualizarEmpresa(marcaId: string, id: string, dto: Partial<EmpresaDto>) {
    if (!(await this.prisma.crmEmpresa.count({ where: { id, marcaId } }))) throw new NotFoundException('Empresa no encontrada');
    const ruc = dto.ruc === undefined ? undefined : limpio(dto.ruc);
    if (ruc && !rucValido(ruc)) throw new BadRequestException('El RUC debe tener 11 dígitos');
    const opc = (v: string | null | undefined) => (v === undefined ? undefined : limpio(v));
    try {
      return await this.prisma.crmEmpresa.update({ where: { id, marcaId }, data: { razonSocial: dto.razonSocial?.trim(), ruc, rubro: opc(dto.rubro), web: opc(dto.web), telefono: opc(dto.telefono), direccion: opc(dto.direccion), notas: opc(dto.notas) } });
    } catch (e) {
      if (esP2002(e)) throw new BadRequestException('Ya existe una empresa con ese RUC en esta marca');
      throw e;
    }
  }

  async eliminarEmpresa(marcaId: string, id: string) {
    if (!(await this.prisma.crmEmpresa.count({ where: { id, marcaId } }))) throw new NotFoundException('Empresa no encontrada');
    await this.prisma.crmEmpresa.delete({ where: { id, marcaId } });
    return { ok: true as const };
  }

  listarContactos(marcaId: string, q?: string, empresaId?: string) {
    const t = q?.trim();
    return this.prisma.crmContacto.findMany({
      where: {
        marcaId,
        ...(empresaId ? { empresaId } : {}),
        ...(t ? { OR: [{ nombre: { contains: t, mode: 'insensitive' } }, { email: { contains: t, mode: 'insensitive' } }, { celular: { contains: t } }] } : {}),
      },
      include: { empresa: { select: { id: true, razonSocial: true } }, _count: { select: { oportunidades: true } } },
      orderBy: { nombre: 'asc' },
      take: 500,
    });
  }

  async crearContacto(marcaId: string, dto: ContactoDto) {
    await this.validarRelaciones(marcaId, dto.empresaId);
    try {
      return await this.prisma.crmContacto.create({
        data: { marcaId, nombre: dto.nombre.trim(), cargo: limpio(dto.cargo), email: limpio(dto.email)?.toLowerCase() ?? null, celular: limpio(dto.celular), documento: limpio(dto.documento), notas: limpio(dto.notas), empresaId: dto.empresaId ?? null },
      });
    } catch (e) {
      if (esP2002(e)) throw new BadRequestException('Ya existe un contacto con ese correo en esta marca');
      throw e;
    }
  }

  async actualizarContacto(marcaId: string, id: string, dto: Partial<ContactoDto>) {
    if (!(await this.prisma.crmContacto.count({ where: { id, marcaId } }))) throw new NotFoundException('Contacto no encontrado');
    await this.validarRelaciones(marcaId, dto.empresaId);
    const opc = (v: string | null | undefined) => (v === undefined ? undefined : limpio(v));
    try {
      return await this.prisma.crmContacto.update({
        where: { id, marcaId },
        data: { nombre: dto.nombre?.trim(), cargo: opc(dto.cargo), email: dto.email === undefined ? undefined : (limpio(dto.email)?.toLowerCase() ?? null), celular: opc(dto.celular), documento: opc(dto.documento), notas: opc(dto.notas), empresaId: dto.empresaId },
      });
    } catch (e) {
      if (esP2002(e)) throw new BadRequestException('Ya existe un contacto con ese correo en esta marca');
      throw e;
    }
  }

  async eliminarContacto(marcaId: string, id: string) {
    if (!(await this.prisma.crmContacto.count({ where: { id, marcaId } }))) throw new NotFoundException('Contacto no encontrado');
    await this.prisma.crmContacto.delete({ where: { id, marcaId } });
    return { ok: true as const };
  }

  // ------------------------------------------------------------------ reportes

  /**
   * Reportes de ventas del CRM en los últimos `meses` (por fecha de cierre o de creación): embudo actual, ganado por
   * mes, por comercial, por origen, conversión y ciclo de venta. Los montos se agrupan por moneda (PEN/USD).
   */
  async reportes(marcaId: string, meses: number) {
    const desde = new Date();
    desde.setMonth(desde.getMonth() - meses + 1, 1);
    desde.setHours(0, 0, 0, 0);
    const [abiertas, cerradas, creadas, asignables] = await Promise.all([
      this.prisma.crmOportunidad.findMany({ where: { marcaId, etapa: { in: ETAPAS_ABIERTAS } }, select: { etapa: true, monto: true, moneda: true, probabilidad: true, asignadoId: true } }),
      this.prisma.crmOportunidad.findMany({ where: { marcaId, cerradoAt: { gte: desde } }, select: { etapa: true, monto: true, moneda: true, asignadoId: true, origen: true, createdAt: true, ganadoAt: true, cerradoAt: true } }),
      this.prisma.crmOportunidad.findMany({ where: { marcaId, createdAt: { gte: desde } }, select: { origen: true, etapa: true } }),
      this.asignables(marcaId),
    ]);

    const sumar = (filas: { monto: unknown; moneda: string }[]) => filas.reduce<Record<string, number>>((acc, f) => ((acc[f.moneda] = (acc[f.moneda] ?? 0) + n(f.monto)), acc), {});
    const embudo = ETAPAS_ABIERTAS.map((etapa) => {
      const filas = abiertas.filter((o) => o.etapa === etapa);
      return { etapa, cantidad: filas.length, montos: sumar(filas) };
    });
    const ponderado = abiertas.reduce<Record<string, number>>((acc, o) => ((acc[o.moneda] = (acc[o.moneda] ?? 0) + (n(o.monto) * (o.probabilidad ?? PROBABILIDAD[o.etapa])) / 100), acc), {});

    const ganadas = cerradas.filter((o) => o.etapa === 'GANADO');
    const perdidas = cerradas.filter((o) => o.etapa === 'PERDIDO');
    const claveMes = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const porMes = Array.from({ length: meses }, (_, i) => {
      const d = new Date(desde.getFullYear(), desde.getMonth() + i, 1);
      const filas = ganadas.filter((o) => o.ganadoAt && claveMes(o.ganadoAt) === claveMes(d));
      return { mes: claveMes(d), ganadas: filas.length, perdidas: perdidas.filter((o) => o.cerradoAt && claveMes(o.cerradoAt) === claveMes(d)).length, montos: sumar(filas) };
    });

    const responsables = [...asignables.map((u) => ({ id: u.id as string | null, nombre: u.nombre ?? u.email })), { id: null, nombre: 'Sin asignar' }];
    const porComercial = responsables
      .map((r) => {
        const g = ganadas.filter((o) => o.asignadoId === r.id);
        const p = perdidas.filter((o) => o.asignadoId === r.id);
        return { asignadoId: r.id, nombre: r.nombre, abiertas: abiertas.filter((o) => o.asignadoId === r.id).length, ganadas: g.length, perdidas: p.length, montos: sumar(g), conversion: g.length + p.length ? Math.round((g.length / (g.length + p.length)) * 100) : null };
      })
      .filter((r) => r.abiertas || r.ganadas || r.perdidas);

    const ORIGENES: OrigenOportunidad[] = ['MANUAL', 'COTIZADOR', 'COTIZACION', 'CONTACTO_WEB', 'PRESUPUESTO'];
    const porOrigen = ORIGENES.map((origen) => {
      const c = creadas.filter((o) => o.origen === origen);
      const g = ganadas.filter((o) => o.origen === origen);
      return { origen, creadas: c.length, ganadas: g.length, montos: sumar(g) };
    }).filter((o) => o.creadas || o.ganadas);

    const ciclos = ganadas.filter((o) => o.ganadoAt).map((o) => (o.ganadoAt!.getTime() - o.createdAt.getTime()) / 86_400_000);
    return {
      meses,
      desde: desde.toISOString(),
      totales: {
        abiertas: abiertas.length,
        pipeline: sumar(abiertas),
        ponderado,
        ganadas: ganadas.length,
        perdidas: perdidas.length,
        montoGanado: sumar(ganadas),
        conversion: ganadas.length + perdidas.length ? Math.round((ganadas.length / (ganadas.length + perdidas.length)) * 100) : null,
        cicloDias: ciclos.length ? Math.round(ciclos.reduce((a, b) => a + b, 0) / ciclos.length) : null,
      },
      embudo,
      porMes,
      porComercial,
      porOrigen,
    };
  }
}
