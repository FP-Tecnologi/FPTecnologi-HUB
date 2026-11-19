import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { EtapaOportunidad, OrigenOportunidad, Prisma, TipoActividadCrm } from '../generated/prisma/client.js';
import type {
  ActividadDto, ActualizarActividadDto, ActualizarOportunidadDto, CambiarEtapaDto, ContactoDto, CrearOportunidadDto, EmpresaDto, FiltrosOportunidades, MetaDto,
} from './crm.dto.js';

/** Roles que trabajan el CRM de una marca (y a quienes se puede asignar una oportunidad). */
export const ROLES_CRM = ['admin', 'jefe_comercial', 'comercial'];
/** Roles que ven TODAS las oportunidades de la marca y pueden asignarlas (dirección: solo lectura). Los demás ven solo las suyas. */
export const ROLES_VE_TODO_CRM = ['admin', 'jefe_comercial', 'direccion'];
/** Roles con acceso de lectura al CRM de una marca (vista Comercial multimarca). */
export const ROLES_LEE_CRM = ['admin', 'jefe_comercial', 'comercial', 'direccion'];
/** Marca a la que el usuario accede en la vista Comercial: su id y su rol en ella (sale del token, nunca del cliente). */
export interface MarcaCrm { marcaId: string; rol: string }
/** Quién consulta: su id y si ve todo el CRM o solo lo que tiene asignado. */
export interface AmbitoCrm { usuarioId: string; veTodo: boolean }
const TODO: AmbitoCrm = { usuarioId: '', veTodo: true };
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
const mesActual = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
const resumenVacio = () => ({ abiertas: 0, pipeline: {}, ponderado: {}, ganadas: 0, perdidas: 0, montoGanado: {}, conversion: null as number | null });
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

  /** Un comercial que no ve todo solo se ve a sí mismo (no se listan sus compañeros). */
  async asignables(marcaId: string, ambito: AmbitoCrm = TODO) {
    const filas = await this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { in: ROLES_CRM } }, usuario: { activo: true, ...(ambito.veTodo ? {} : { id: ambito.usuarioId }) } },
      select: { rol: { select: { nombre: true } }, usuario: { select: { id: true, nombre: true, email: true } } },
    });
    return filas.map((f) => ({ ...f.usuario, rol: f.rol.nombre })).sort((a, b) => (a.nombre ?? a.email).localeCompare(b.nombre ?? b.email));
  }

  /** Un comercial solo toca las oportunidades que tiene asignadas; las demás responden "no encontrada" (no revela que existen). */
  private async asegurarAcceso(marcaId: string, oportunidadId: string, ambito: AmbitoCrm) {
    if (ambito.veTodo) return;
    const ok = await this.prisma.crmOportunidad.count({ where: { id: oportunidadId, marcaId, asignadoId: ambito.usuarioId } });
    if (!ok) throw new NotFoundException('Oportunidad no encontrada');
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

  listar(marcaId: string, f: FiltrosOportunidades, usuarioId: string, veTodo = true) {
    return this.prisma.crmOportunidad.findMany({ where: this.filtroOportunidades({ marcaId }, f, usuarioId, veTodo), include: INCLUDE_LISTA, orderBy: { updatedAt: 'desc' }, take: 500 });
  }

  /** Filtros de lista compartidos por la vista de una marca y la consolidada. `base` fija la marca (o las marcas). */
  private filtroOportunidades(base: Prisma.CrmOportunidadWhereInput, f: FiltrosOportunidades, usuarioId: string, veTodo: boolean): Prisma.CrmOportunidadWhereInput {
    const q = f.q?.trim();
    return {
      ...base,
      ...(f.etapa ? { etapa: f.etapa } : f.estado === 'abiertas' ? { etapa: { in: ETAPAS_ABIERTAS } } : f.estado === 'cerradas' ? { etapa: { in: ['GANADO', 'PERDIDO'] } } : {}),
      // Quien no ve todo queda fijado a sus propias oportunidades, sin importar el filtro que mande.
      ...(!veTodo ? { asignadoId: usuarioId } : f.asignado === 'yo' ? { asignadoId: usuarioId } : f.asignado === 'sin' ? { asignadoId: null } : f.asignado ? { asignadoId: f.asignado } : {}),
      ...(f.origen ? { origen: f.origen } : {}),
      ...(f.tipoProceso ? { tipoProceso: f.tipoProceso } : {}),
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
  }

  /**
   * Vista Comercial: oportunidades de TODAS las marcas del usuario en una sola lista, cada una con su marca. `marcas` viene
   * del token (rol por marca); `soloMarcas` es un filtro opcional que solo puede restringir, nunca ampliar. En las marcas
   * donde no ve todo el CRM (comercial) solo salen las que tiene asignadas.
   */
  async listarConsolidado(marcas: MarcaCrm[], f: FiltrosOportunidades, usuarioId: string, soloMarcas?: string[]) {
    const permitidas = this.marcasConsolidadas(marcas, soloMarcas);
    if (permitidas.length === 0) return [];
    const ids = permitidas.map((m) => m.marcaId);
    const veTodoIds = permitidas.filter((m) => ROLES_VE_TODO_CRM.includes(m.rol)).map((m) => m.marcaId);
    const restringidas = veTodoIds.length < ids.length;
    // `marcaId` va en la raíz del where (el candado multi-tenant lo exige); la restricción por responsable solo aplica a las marcas donde no ve todo.
    const base: Prisma.CrmOportunidadWhereInput = { marcaId: { in: ids }, ...(restringidas ? { AND: [{ OR: [{ marcaId: { in: veTodoIds } }, { asignadoId: usuarioId }] }] } : {}) };
    // Los filtros 'yo' / 'sin' / id sí se respetan; el filtro por responsable de quien no ve todo ya lo cubre la restricción de arriba.
    return this.prisma.crmOportunidad.findMany({
      where: this.filtroOportunidades(base, f, usuarioId, true),
      include: { ...INCLUDE_LISTA, marca: { select: { id: true, nombre: true, colorPrimario: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 800,
    });
  }

  /** Marcas con acceso al CRM, opcionalmente acotadas por el filtro del cliente (solo recorta, nunca agrega). */
  marcasConsolidadas(marcas: MarcaCrm[], soloMarcas?: string[]): MarcaCrm[] {
    const conAcceso = marcas.filter((m) => ROLES_LEE_CRM.includes(m.rol));
    return soloMarcas?.length ? conAcceso.filter((m) => soloMarcas.includes(m.marcaId)) : conAcceso;
  }

  /** Agenda de todas las marcas del usuario: tareas pendientes y próximas acciones, con la marca de cada una. */
  async agendaConsolidada(marcas: MarcaCrm[], usuarioId: string, soloMias: boolean, soloMarcas?: string[]) {
    const permitidas = this.marcasConsolidadas(marcas, soloMarcas);
    if (permitidas.length === 0) return { tareas: [], acciones: [] };
    const ids = permitidas.map((m) => m.marcaId);
    const veTodoIds = permitidas.filter((m) => ROLES_VE_TODO_CRM.includes(m.rol)).map((m) => m.marcaId);
    const deQuien: Prisma.CrmOportunidadWhereInput = soloMias || veTodoIds.length < ids.length
      ? { AND: [{ OR: [...(soloMias ? [] : [{ marcaId: { in: veTodoIds } }]), { asignadoId: usuarioId }] }] }
      : {};
    const conMarca = { marca: { select: { id: true, nombre: true, colorPrimario: true } } };
    const [tareas, acciones] = await Promise.all([
      this.prisma.crmActividad.findMany({
        where: { marcaId: { in: ids }, tipo: 'TAREA', hecha: false, oportunidad: { marcaId: { in: ids }, etapa: { in: ETAPAS_ABIERTAS }, ...deQuien } },
        orderBy: { fecha: 'asc' },
        take: 300,
        include: { ...conMarca, oportunidad: { select: { id: true, numero: true, titulo: true, etapa: true, asignado: { select: { nombre: true, email: true } }, contacto: { select: { nombre: true } } } } },
      }),
      this.prisma.crmOportunidad.findMany({
        where: { marcaId: { in: ids }, etapa: { in: ETAPAS_ABIERTAS }, proximaAccionAt: { not: null }, ...deQuien },
        orderBy: { proximaAccionAt: 'asc' },
        take: 300,
        include: { ...INCLUDE_LISTA, ...conMarca },
      }),
    ]);
    return { tareas, acciones };
  }

  async obtener(marcaId: string, id: string, ambito: AmbitoCrm = TODO) {
    const o = await this.prisma.crmOportunidad.findFirst({
      where: { id, marcaId, ...(ambito.veTodo ? {} : { asignadoId: ambito.usuarioId }) },
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
  async porOrigen(marcaId: string, origen: OrigenOportunidad, origenId: string, ambito: AmbitoCrm = TODO) {
    const propias = ambito.veTodo ? {} : { asignadoId: ambito.usuarioId };
    const directa = await this.prisma.crmOportunidad.findFirst({ where: { marcaId, origen, origenId, ...propias }, select: { id: true, numero: true, etapa: true } });
    if (directa) return directa;
    const act = await this.prisma.crmActividad.findFirst({ where: { marcaId, origen, origenId, oportunidad: propias }, select: { oportunidad: { select: { id: true, numero: true, etapa: true } } } });
    return act?.oportunidad ?? null;
  }

  async crear(marcaId: string, dto: CrearOportunidadDto, email: string, ambito: AmbitoCrm = TODO) {
    // Un comercial que crea una oportunidad la queda asignada a sí mismo (si no, no la vería).
    if (!ambito.veTodo) dto = { ...dto, asignadoId: ambito.usuarioId };
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
      tipoProceso: dto.tipoProceso ?? null,
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
    return this.obtener(marcaId, o.id, ambito);
  }

  async actualizar(marcaId: string, id: string, dto: ActualizarOportunidadDto, email: string, ambito: AmbitoCrm = TODO) {
    await this.asegurarAcceso(marcaId, id, ambito);
    const o = await this.prisma.crmOportunidad.findFirst({ where: { id, marcaId }, include: { asignado: { select: { nombre: true, email: true } } } });
    if (!o) throw new NotFoundException('Oportunidad no encontrada');
    // Asignar o reasignar es del admin / jefe comercial: un comercial no puede pasarla a otra persona ni dejarla sin responsable.
    if (!ambito.veTodo && dto.asignadoId !== undefined && dto.asignadoId !== o.asignadoId) throw new ForbiddenException('Solo el administrador o el jefe comercial asigna oportunidades');
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
        tipoProceso: dto.tipoProceso,
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
    return this.obtener(marcaId, id, ambito);
  }

  async cambiarEtapa(marcaId: string, id: string, dto: CambiarEtapaDto, email: string, ambito: AmbitoCrm = TODO) {
    await this.asegurarAcceso(marcaId, id, ambito);
    const o = await this.prisma.crmOportunidad.findFirst({ where: { id, marcaId }, select: { etapa: true } });
    if (!o) throw new NotFoundException('Oportunidad no encontrada');
    if (o.etapa === dto.etapa) return this.obtener(marcaId, id, ambito);
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
    return this.obtener(marcaId, id, ambito);
  }

  async eliminar(marcaId: string, id: string) {
    if (!(await this.prisma.crmOportunidad.count({ where: { id, marcaId } }))) throw new NotFoundException('Oportunidad no encontrada');
    await this.prisma.crmOportunidad.delete({ where: { id, marcaId } });
    return { ok: true as const };
  }

  // -------------------------------------------------------------- actividades

  async agregarActividad(marcaId: string, oportunidadId: string, dto: ActividadDto, email: string, ambito: AmbitoCrm = TODO) {
    await this.asegurarAcceso(marcaId, oportunidadId, ambito);
    if (!(await this.prisma.crmOportunidad.count({ where: { id: oportunidadId, marcaId } }))) throw new NotFoundException('Oportunidad no encontrada');
    const tarea = dto.tipo === 'TAREA';
    await this.prisma.crmActividad.create({
      data: { marcaId, oportunidadId, tipo: dto.tipo as TipoActividadCrm, texto: dto.texto.trim(), fecha: dto.fecha ? new Date(dto.fecha) : new Date(), hecha: tarea ? !!dto.hecha : true, autor: email },
    });
    await this.prisma.crmOportunidad.update({ where: { id: oportunidadId, marcaId }, data: { updatedAt: new Date() } });
    return this.obtener(marcaId, oportunidadId, ambito);
  }

  async actualizarActividad(marcaId: string, id: string, dto: ActualizarActividadDto, ambito: AmbitoCrm = TODO) {
    const a = await this.prisma.crmActividad.findFirst({ where: { id, marcaId }, select: { oportunidadId: true, tipo: true } });
    if (!a) throw new NotFoundException('Actividad no encontrada');
    await this.asegurarAcceso(marcaId, a.oportunidadId, ambito);
    if (a.tipo === 'ETAPA' || a.tipo === 'SOLICITUD') throw new BadRequestException('Los registros automáticos no se editan');
    await this.prisma.crmActividad.update({ where: { id, marcaId }, data: { hecha: dto.hecha, texto: dto.texto?.trim(), fecha: dto.fecha ? new Date(dto.fecha) : undefined } });
    return this.obtener(marcaId, a.oportunidadId, ambito);
  }

  async eliminarActividad(marcaId: string, id: string, ambito: AmbitoCrm = TODO) {
    const a = await this.prisma.crmActividad.findFirst({ where: { id, marcaId }, select: { oportunidadId: true, tipo: true } });
    if (!a) throw new NotFoundException('Actividad no encontrada');
    await this.asegurarAcceso(marcaId, a.oportunidadId, ambito);
    if (a.tipo === 'ETAPA' || a.tipo === 'SOLICITUD') throw new BadRequestException('Los registros automáticos no se borran');
    await this.prisma.crmActividad.delete({ where: { id, marcaId } });
    return this.obtener(marcaId, a.oportunidadId, ambito);
  }

  /** Tareas pendientes y próximas acciones de las oportunidades abiertas (de todos o solo mías). */
  async agenda(marcaId: string, usuarioId: string, soloMias: boolean, veTodo = true) {
    const deQuien = soloMias || !veTodo ? { asignadoId: usuarioId } : {};
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
      include: { empresaPadre: { select: { id: true, razonSocial: true } }, _count: { select: { contactos: true, oportunidades: true, sedes: true } } },
      orderBy: { razonSocial: 'asc' },
      take: 500,
    });
  }

  /**
   * Valida la empresa principal de una sede: existe en la marca, no es la misma empresa ni una de sus propias sedes (sin ciclos).
   * Devuelve su RUC para que una sede con el mismo RUC no choque con la restricción de RUC único.
   */
  private async validarPadre(marcaId: string, padreId: string | null | undefined, propiaId?: string): Promise<{ ruc: string | null } | null> {
    if (!padreId) return null;
    if (propiaId && padreId === propiaId) throw new BadRequestException('Una empresa no puede ser sede de sí misma');
    const padre = await this.prisma.crmEmpresa.findFirst({ where: { id: padreId, marcaId }, select: { ruc: true, empresaPadreId: true } });
    if (!padre) throw new BadRequestException('La empresa principal no existe en esta marca');
    // Subir por la cadena de padres: si aparece la propia empresa, se formaría un ciclo.
    let actual = padre.empresaPadreId;
    for (let i = 0; propiaId && actual && i < 20; i++) {
      if (actual === propiaId) throw new BadRequestException('Esa empresa ya depende de esta: elige otra como principal');
      actual = (await this.prisma.crmEmpresa.findFirst({ where: { id: actual, marcaId }, select: { empresaPadreId: true } }))?.empresaPadreId ?? null;
    }
    return { ruc: padre.ruc };
  }

  async crearEmpresa(marcaId: string, dto: EmpresaDto) {
    let ruc = limpio(dto.ruc);
    if (ruc && !rucValido(ruc)) throw new BadRequestException('El RUC debe tener 11 dígitos (empieza con 10, 15, 16, 17 o 20)');
    const padre = await this.validarPadre(marcaId, dto.empresaPadreId);
    // Una sede suele compartir el RUC de la principal: se guarda sin RUC propio (el RUC es único por marca).
    if (padre && ruc && ruc === padre.ruc) ruc = null;
    try {
      return await this.prisma.crmEmpresa.create({ data: { marcaId, razonSocial: dto.razonSocial.trim(), ruc, rubro: limpio(dto.rubro), web: limpio(dto.web), telefono: limpio(dto.telefono), direccion: limpio(dto.direccion), notas: limpio(dto.notas), empresaPadreId: dto.empresaPadreId ?? null } });
    } catch (e) {
      if (esP2002(e)) throw new BadRequestException('Ya existe una empresa con ese RUC en esta marca');
      throw e;
    }
  }

  async actualizarEmpresa(marcaId: string, id: string, dto: Partial<EmpresaDto>) {
    if (!(await this.prisma.crmEmpresa.count({ where: { id, marcaId } }))) throw new NotFoundException('Empresa no encontrada');
    let ruc = dto.ruc === undefined ? undefined : limpio(dto.ruc);
    if (ruc && !rucValido(ruc)) throw new BadRequestException('El RUC debe tener 11 dígitos');
    const padre = await this.validarPadre(marcaId, dto.empresaPadreId, id);
    if (padre && ruc && ruc === padre.ruc) ruc = null;
    const opc = (v: string | null | undefined) => (v === undefined ? undefined : limpio(v));
    try {
      return await this.prisma.crmEmpresa.update({ where: { id, marcaId }, data: { razonSocial: dto.razonSocial?.trim(), ruc, rubro: opc(dto.rubro), web: opc(dto.web), telefono: opc(dto.telefono), direccion: opc(dto.direccion), notas: opc(dto.notas), empresaPadreId: dto.empresaPadreId } });
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
  /**
   * Vista Comercial: resumen de ventas por marca (y total) de todas las marcas del usuario. Donde no ve todo el CRM (comercial)
   * cuenta solo lo suyo; con `soloMias` cuenta solo lo suyo en todas. Las monedas no se mezclan: cada monto va por moneda.
   */
  async reportesPorMarca(marcas: MarcaCrm[], meses: number, usuarioId: string, soloMias: boolean, soloMarcas?: string[]) {
    const permitidas = this.marcasConsolidadas(marcas, soloMarcas);
    const desde = new Date();
    desde.setMonth(desde.getMonth() - meses + 1, 1);
    desde.setHours(0, 0, 0, 0);
    if (permitidas.length === 0) return { meses, desde: desde.toISOString(), totales: resumenVacio(), porMarca: [] };
    const ids = permitidas.map((m) => m.marcaId);
    const [abiertas, cerradas, nombres] = await Promise.all([
      this.prisma.crmOportunidad.findMany({ where: { marcaId: { in: ids }, etapa: { in: ETAPAS_ABIERTAS } }, select: { marcaId: true, etapa: true, monto: true, moneda: true, probabilidad: true, asignadoId: true } }),
      this.prisma.crmOportunidad.findMany({ where: { marcaId: { in: ids }, cerradoAt: { gte: desde } }, select: { marcaId: true, etapa: true, monto: true, moneda: true, asignadoId: true } }),
      this.prisma.marca.findMany({ where: { id: { in: ids } }, select: { id: true, nombre: true, colorPrimario: true } }),
    ]);
    const veTodo = new Set(permitidas.filter((m) => ROLES_VE_TODO_CRM.includes(m.rol)).map((m) => m.marcaId));
    const mio = (o: { marcaId: string; asignadoId: string | null }) => (veTodo.has(o.marcaId) && !soloMias) || o.asignadoId === usuarioId;
    const resumir = (marcaId: string | null) => {
      const ab = abiertas.filter((o) => mio(o) && (!marcaId || o.marcaId === marcaId));
      const ce = cerradas.filter((o) => mio(o) && (!marcaId || o.marcaId === marcaId));
      const g = ce.filter((o) => o.etapa === 'GANADO');
      const p = ce.filter((o) => o.etapa === 'PERDIDO');
      const sumar = (filas: { monto: unknown; moneda: string }[]) => filas.reduce<Record<string, number>>((acc, f) => ((acc[f.moneda] = (acc[f.moneda] ?? 0) + n(f.monto)), acc), {});
      const ponderado = ab.reduce<Record<string, number>>((acc, o) => ((acc[o.moneda] = (acc[o.moneda] ?? 0) + (n(o.monto) * (o.probabilidad ?? PROBABILIDAD[o.etapa])) / 100), acc), {});
      return {
        abiertas: ab.length, pipeline: sumar(ab), ponderado, ganadas: g.length, perdidas: p.length, montoGanado: sumar(g),
        conversion: g.length + p.length ? Math.round((g.length / (g.length + p.length)) * 100) : null,
      };
    };
    const porMarca = nombres
      .map((m) => ({ marca: m, rol: permitidas.find((x) => x.marcaId === m.id)?.rol ?? '', ...resumir(m.id) }))
      .sort((a, b) => b.abiertas - a.abiertas || a.marca.nombre.localeCompare(b.marca.nombre));
    return { meses, desde: desde.toISOString(), totales: resumir(null), porMarca };
  }

  // ------------------------------------------------------------------- metas

  /**
   * Metas de un mes con su avance (lo ganado en ese mes por el comercial, o por toda la marca en la meta de marca). Quien no ve todo
   * el CRM recibe solo su meta y la de la marca.
   */
  async listarMetas(marcaId: string, periodo: string, ambito: AmbitoCrm = TODO) {
    const per = /^d{4}-(0[1-9]|1[0-2])$/.test(periodo) ? periodo : mesActual();
    const [anio, mes] = per.split('-').map(Number) as [number, number];
    const desde = new Date(anio, mes - 1, 1);
    const hasta = new Date(anio, mes, 1);
    const [metas, ganadas] = await Promise.all([
      this.prisma.crmMeta.findMany({
        where: { marcaId, periodo: per, ...(ambito.veTodo ? {} : { OR: [{ usuarioId: ambito.usuarioId }, { usuarioId: null }] }) },
        include: { usuario: { select: { id: true, nombre: true, email: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.crmOportunidad.findMany({ where: { marcaId, etapa: 'GANADO', ganadoAt: { gte: desde, lt: hasta } }, select: { asignadoId: true, monto: true, moneda: true } }),
    ]);
    return {
      periodo: per,
      metas: metas.map((m) => {
        const ganado = ganadas.filter((g) => g.moneda === m.moneda && (m.usuarioId === null || g.asignadoId === m.usuarioId)).reduce((a, g) => a + n(g.monto), 0);
        const meta = n(m.monto);
        return { id: m.id, usuarioId: m.usuarioId, usuario: m.usuario, periodo: m.periodo, moneda: m.moneda, monto: meta, ganado, avance: meta > 0 ? Math.round((ganado / meta) * 100) : null };
      }),
    };
  }

  /** Crea o reemplaza la meta de ese comercial (o de la marca) en ese mes y moneda. Solo admin y jefe comercial (lo exige el controlador). */
  async guardarMeta(marcaId: string, dto: MetaDto) {
    await this.validarAsignado(marcaId, dto.usuarioId);
    const moneda = dto.moneda ?? 'PEN';
    const usuarioId = dto.usuarioId ?? null;
    const existente = await this.prisma.crmMeta.findFirst({ where: { marcaId, usuarioId, periodo: dto.periodo, moneda } });
    if (existente) return this.prisma.crmMeta.update({ where: { id: existente.id }, data: { monto: dto.monto } });
    return this.prisma.crmMeta.create({ data: { marcaId, usuarioId, periodo: dto.periodo, moneda, monto: dto.monto } });
  }

  async eliminarMeta(marcaId: string, id: string) {
    const { count } = await this.prisma.crmMeta.deleteMany({ where: { id, marcaId } });
    if (!count) throw new NotFoundException('Meta no encontrada');
    return { ok: true };
  }

  async reportes(marcaId: string, meses: number, soloUsuarioId?: string) {
    const propias = soloUsuarioId ? { asignadoId: soloUsuarioId } : {};
    const desde = new Date();
    desde.setMonth(desde.getMonth() - meses + 1, 1);
    desde.setHours(0, 0, 0, 0);
    const [abiertas, cerradas, creadas, asignables] = await Promise.all([
      this.prisma.crmOportunidad.findMany({ where: { marcaId, ...propias, etapa: { in: ETAPAS_ABIERTAS } }, select: { etapa: true, monto: true, moneda: true, probabilidad: true, asignadoId: true } }),
      this.prisma.crmOportunidad.findMany({ where: { marcaId, ...propias, cerradoAt: { gte: desde } }, select: { etapa: true, monto: true, moneda: true, asignadoId: true, origen: true, createdAt: true, ganadoAt: true, cerradoAt: true } }),
      this.prisma.crmOportunidad.findMany({ where: { marcaId, ...propias, createdAt: { gte: desde } }, select: { origen: true, etapa: true } }),
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
