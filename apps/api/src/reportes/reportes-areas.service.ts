import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { diaLima, resolverRango, type Rango } from './reportes.service.js';

const MS_DIA = 24 * 60 * 60 * 1000;
const r2 = (n: number) => Math.round(n * 100) / 100;

export type Formato = 'num' | 'usd' | 'pct' | 'dias';
export interface Kpi { clave: string; label: string; valor: number; previo?: number; formato: Formato }
export interface Tabla { titulo: string; subtitulo?: string; columnas: string[]; filas: (string | number)[][] }
export interface ReporteArea {
  area: string;
  rango: { desde: string; hasta: string; dias: number };
  kpis: Kpi[];
  serie: { titulo: string; etiquetas: string[]; series: { nombre: string; datos: number[] }[] };
  tablas: Tabla[];
}

/** Rango anterior de igual duración, para comparar. */
export function rangoPrevio(r: Rango): Rango {
  const largo = r.hasta.getTime() - r.desde.getTime() + 1;
  return { desde: new Date(r.desde.getTime() - largo), hasta: new Date(r.desde.getTime() - 1), dias: r.dias };
}

/** Cuenta eventos por día de Lima (rellena con 0 los días sin eventos). */
export function contarPorDia(fechas: Date[], r: Rango): number[] {
  const idx = new Map<string, number>();
  for (let i = 0; i <= r.dias; i++) idx.set(diaLima(new Date(r.desde.getTime() + i * MS_DIA)), i);
  const out = Array.from({ length: r.dias + 1 }, () => 0);
  for (const f of fechas) {
    const i = idx.get(diaLima(f));
    if (i !== undefined) out[i]! += 1;
  }
  return out;
}

export const etiquetasDias = (r: Rango) => Array.from({ length: r.dias + 1 }, (_, i) => diaLima(new Date(r.desde.getTime() + i * MS_DIA)));

/** Agrupa por una clave de texto y devuelve filas `[clave, n]` de mayor a menor. */
export function ranking(valores: (string | null | undefined)[], vacio = 'Sin definir', n = 10): [string, number][] {
  const m = new Map<string, number>();
  for (const v of valores) m.set(v?.trim() || vacio, (m.get(v?.trim() || vacio) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

const porcentaje = (a: number, b: number) => (b > 0 ? r2((a / b) * 100) : 0);
const rangoDe = (r: Rango) => ({ desde: diaLima(r.desde), hasta: diaLima(r.hasta), dias: r.dias + 1 });
const entre = (r: Rango) => ({ gte: r.desde, lte: r.hasta });

@Injectable()
export class ReportesAreasService {
  constructor(private readonly prisma: PrismaService) {}

  /** Cuántos leads (cotizador, contacto web, cotizaciones, presupuestos) llegaron en un rango, con sus fechas y orígenes. */
  private async leads(marcaId: string, r: Rango) {
    const createdAt = entre(r);
    const [cotizador, contactos, cotizaciones, presupuestos] = await Promise.all([
      this.prisma.leadCotizador.findMany({ where: { marcaId, createdAt }, select: { createdAt: true, origen: true, interes: true }, take: 20000 }),
      this.prisma.contactoWeb.findMany({ where: { marcaId, createdAt, tipo: { not: 'RECLAMO' } }, select: { createdAt: true, origen: true }, take: 20000 }),
      this.prisma.cotizacion.findMany({ where: { marcaId, createdAt }, select: { createdAt: true, origen: true }, take: 20000 }),
      this.prisma.presupuesto.findMany({ where: { marcaId, createdAt }, select: { createdAt: true, origen: true }, take: 20000 }),
    ]);
    const todos = [...cotizador, ...contactos, ...cotizaciones, ...presupuestos];
    return { cotizador, contactos, cotizaciones, presupuestos, total: todos.length, fechas: todos.map((l) => l.createdAt), origenes: todos.map((l) => l.origen) };
  }

  private async visitas(marcaId: string, r: Rango) {
    const [porDia, origenes, dispositivos, paginas] = await Promise.all([
      this.prisma.$queryRaw<{ dia: string; vistas: number; visitas: number; visitantes: number }[]>`
        SELECT to_char("createdAt" - interval '5 hours', 'YYYY-MM-DD') AS dia,
               count(*)::int AS vistas,
               count(*) FILTER (WHERE "origen" <> 'interno')::int AS visitas,
               count(DISTINCT "visitante")::int AS visitantes
        FROM "VisitaWeb" WHERE "marcaId" = ${marcaId} AND "createdAt" >= ${r.desde} AND "createdAt" <= ${r.hasta}
        GROUP BY 1 ORDER BY 1`,
      this.prisma.visitaWeb.groupBy({ by: ['origen'], where: { marcaId, createdAt: entre(r), origen: { not: 'interno' } }, _count: { _all: true } }),
      this.prisma.visitaWeb.groupBy({ by: ['dispositivo'], where: { marcaId, createdAt: entre(r), origen: { not: 'interno' } }, _count: { _all: true } }),
      this.prisma.visitaWeb.groupBy({ by: ['ruta'], where: { marcaId, createdAt: entre(r) }, _count: { _all: true } }),
    ]);
    const mapa = new Map(porDia.map((d) => [d.dia, d]));
    const dias = etiquetasDias(r).map((d) => ({ dia: d, vistas: mapa.get(d)?.vistas ?? 0, visitas: mapa.get(d)?.visitas ?? 0, visitantes: mapa.get(d)?.visitantes ?? 0 }));
    const orden = <T extends { _count: { _all: number } }>(f: T[], n: number) => [...f].sort((a, b) => b._count._all - a._count._all).slice(0, n);
    return {
      dias,
      vistas: dias.reduce((s, d) => s + d.vistas, 0),
      visitas: dias.reduce((s, d) => s + d.visitas, 0),
      visitantes: dias.reduce((s, d) => s + d.visitantes, 0),
      origenes: orden(origenes, 10).map((o) => [o.origen, o._count._all] as [string, number]),
      dispositivos: orden(dispositivos, 3).map((o) => [o.dispositivo, o._count._all] as [string, number]),
      paginas: orden(paginas, 10).map((p) => [p.ruta, p._count._all] as [string, number]),
    };
  }

  // ───────────────────────── Marketing ─────────────────────────
  async marketing(marcaId: string, desde?: string, hasta?: string): Promise<ReporteArea> {
    const r = resolverRango(desde, hasta);
    const p = rangoPrevio(r);
    const [v, vPrev, l, lPrev, suscriptores, suscriptoresPrev, chats] = await Promise.all([
      this.visitas(marcaId, r),
      this.visitas(marcaId, p),
      this.leads(marcaId, r),
      this.leads(marcaId, p),
      this.prisma.suscriptorBoletin.findMany({ where: { marcaId, createdAt: entre(r) }, select: { createdAt: true, origen: true }, take: 20000 }),
      this.prisma.suscriptorBoletin.count({ where: { marcaId, createdAt: entre(p) } }),
      this.prisma.chatConversacion.count({ where: { marcaId, createdAt: entre(r) } }),
    ]);
    return {
      area: 'marketing',
      rango: rangoDe(r),
      kpis: [
        { clave: 'visitas', label: 'Visitas a la web', valor: v.visitas, previo: vPrev.visitas, formato: 'num' },
        { clave: 'visitantes', label: 'Visitantes (suma diaria)', valor: v.visitantes, previo: vPrev.visitantes, formato: 'num' },
        { clave: 'vistas', label: 'Páginas vistas', valor: v.vistas, previo: vPrev.vistas, formato: 'num' },
        { clave: 'leads', label: 'Leads totales', valor: l.total, previo: lPrev.total, formato: 'num' },
        { clave: 'conversion', label: 'Conversión visita → lead', valor: porcentaje(l.total, v.visitas), previo: porcentaje(lPrev.total, vPrev.visitas), formato: 'pct' },
        { clave: 'suscriptores', label: 'Suscriptores del boletín', valor: suscriptores.length, previo: suscriptoresPrev, formato: 'num' },
        { clave: 'chats', label: 'Conversaciones de chat', valor: chats, formato: 'num' },
      ],
      serie: {
        titulo: 'Visitas y leads por día',
        etiquetas: v.dias.map((d) => d.dia),
        series: [
          { nombre: 'Visitas', datos: v.dias.map((d) => d.visitas) },
          { nombre: 'Leads', datos: contarPorDia(l.fechas, r) },
        ],
      },
      tablas: [
        { titulo: 'Leads por tipo', columnas: ['Tipo', 'Leads'], filas: [['Cotizador', l.cotizador.length], ['Contacto web', l.contactos.length], ['Cotizaciones', l.cotizaciones.length], ['Presupuestos', l.presupuestos.length]] },
        { titulo: 'Origen del tráfico', subtitulo: 'Visitas desde fuera de la web', columnas: ['Origen', 'Visitas'], filas: v.origenes },
        { titulo: 'Leads por página de origen', columnas: ['Página', 'Leads'], filas: ranking(l.origenes) },
        { titulo: 'Páginas más vistas', columnas: ['Ruta', 'Vistas'], filas: v.paginas },
        { titulo: 'Dispositivos', columnas: ['Dispositivo', 'Visitas'], filas: v.dispositivos },
        { titulo: 'Interés en el cotizador', subtitulo: 'Servicio o producto elegido', columnas: ['Interés', 'Leads'], filas: ranking(l.cotizador.map((c) => c.interes)) },
        { titulo: 'Suscripciones por página', columnas: ['Página', 'Suscriptores'], filas: ranking(suscriptores.map((s) => s.origen)) },
      ],
    };
  }

  // ───────────────────────── Comercial ─────────────────────────
  async comercial(marcaId: string, desde?: string, hasta?: string): Promise<ReporteArea> {
    const r = resolverRango(desde, hasta);
    const p = rangoPrevio(r);
    const [leads, leadsPrev, cots, cotsPrev, pres, presPrev, ops, opsPrev, contactos] = await Promise.all([
      this.prisma.leadCotizador.findMany({ where: { marcaId, createdAt: entre(r) }, select: { createdAt: true, estado: true, atendidoPor: true }, take: 20000 }),
      this.prisma.leadCotizador.count({ where: { marcaId, createdAt: entre(p) } }),
      this.prisma.cotizacion.findMany({ where: { marcaId, createdAt: entre(r) }, select: { createdAt: true, estado: true, monto: true, moneda: true }, take: 20000 }),
      this.prisma.cotizacion.count({ where: { marcaId, createdAt: entre(p) } }),
      this.prisma.presupuesto.findMany({ where: { marcaId, createdAt: entre(r) }, select: { createdAt: true, estado: true, total: true }, take: 20000 }),
      this.prisma.presupuesto.count({ where: { marcaId, createdAt: entre(p) } }),
      this.prisma.crmOportunidad.findMany({ where: { marcaId, createdAt: entre(r) }, select: { createdAt: true, etapa: true, monto: true, origen: true, ganadoAt: true, asignado: { select: { nombre: true, email: true } } }, take: 20000 }),
      this.prisma.crmOportunidad.count({ where: { marcaId, createdAt: entre(p) } }),
      this.prisma.contactoWeb.findMany({ where: { marcaId, createdAt: entre(r), tipo: { not: 'RECLAMO' } }, select: { createdAt: true, estado: true }, take: 20000 }),
    ]);
    const ganadas = ops.filter((o) => o.etapa === 'GANADO');
    const perdidas = ops.filter((o) => o.etapa === 'PERDIDO');
    const abiertas = ops.filter((o) => o.etapa !== 'GANADO' && o.etapa !== 'PERDIDO');
    const suma = (xs: { monto: unknown }[]) => xs.reduce((s, o) => s + Number(o.monto ?? 0), 0);
    const cerradas = ganadas.length + perdidas.length;
    const porEtapa = (e: string) => ops.filter((o) => o.etapa === e);

    const vendedores = new Map<string, { n: number; ganadas: number; monto: number }>();
    for (const o of ops) {
      const k = o.asignado?.nombre || o.asignado?.email || 'Sin asignar';
      const x = vendedores.get(k) ?? { n: 0, ganadas: 0, monto: 0 };
      x.n += 1;
      if (o.etapa === 'GANADO') { x.ganadas += 1; x.monto += Number(o.monto ?? 0); }
      vendedores.set(k, x);
    }
    const estados = <T extends { estado: string }>(xs: T[]) => ranking(xs.map((x) => x.estado), 'Sin estado', 20);

    return {
      area: 'comercial',
      rango: rangoDe(r),
      kpis: [
        { clave: 'leads', label: 'Leads del cotizador', valor: leads.length, previo: leadsPrev, formato: 'num' },
        { clave: 'cotizaciones', label: 'Cotizaciones pedidas', valor: cots.length, previo: cotsPrev, formato: 'num' },
        { clave: 'presupuestos', label: 'Presupuestos emitidos', valor: pres.length, previo: presPrev, formato: 'num' },
        { clave: 'oportunidades', label: 'Oportunidades nuevas', valor: ops.length, previo: opsPrev, formato: 'num' },
        { clave: 'ganadas', label: 'Oportunidades ganadas', valor: ganadas.length, formato: 'num' },
        { clave: 'cierre', label: 'Tasa de cierre', valor: porcentaje(ganadas.length, cerradas), formato: 'pct' },
        { clave: 'montoGanado', label: 'Monto ganado (CRM)', valor: r2(suma(ganadas)), formato: 'usd' },
        { clave: 'pipeline', label: 'En el embudo (abiertas)', valor: r2(suma(abiertas)), formato: 'usd' },
      ],
      serie: {
        titulo: 'Solicitudes comerciales por día',
        etiquetas: etiquetasDias(r),
        series: [
          { nombre: 'Leads', datos: contarPorDia(leads.map((x) => x.createdAt), r) },
          { nombre: 'Cotizaciones', datos: contarPorDia(cots.map((x) => x.createdAt), r) },
          { nombre: 'Oportunidades', datos: contarPorDia(ops.map((x) => x.createdAt), r) },
        ],
      },
      tablas: [
        { titulo: 'Embudo de oportunidades', columnas: ['Etapa', 'Oportunidades', 'Monto'], filas: ['NUEVO', 'CONTACTADO', 'PROPUESTA', 'NEGOCIACION', 'GANADO', 'PERDIDO'].map((e) => [e, porEtapa(e).length, r2(suma(porEtapa(e)))]) },
        { titulo: 'Leads del cotizador por estado', columnas: ['Estado', 'Leads'], filas: estados(leads) },
        { titulo: 'Cotizaciones por estado', columnas: ['Estado', 'Cotizaciones'], filas: estados(cots) },
        { titulo: 'Presupuestos por estado', columnas: ['Estado', 'Presupuestos', 'Monto'], filas: estados(pres).map(([e, n]) => [e, n, r2(suma(pres.filter((x) => x.estado === e).map((x) => ({ monto: x.total }))))]) },
        { titulo: 'Contactos web por estado', columnas: ['Estado', 'Contactos'], filas: estados(contactos) },
        { titulo: 'Oportunidades por origen', columnas: ['Origen', 'Oportunidades'], filas: ranking(ops.map((o) => o.origen)) },
        { titulo: 'Desempeño por comercial', columnas: ['Comercial', 'Oportunidades', 'Ganadas', 'Monto ganado'], filas: [...vendedores.entries()].sort((a, b) => b[1].monto - a[1].monto || b[1].n - a[1].n).map(([k, v]) => [k, v.n, v.ganadas, r2(v.monto)]) },
      ],
    };
  }

  // ───────────────────────── Soporte / atención al cliente ─────────────────────────
  async soporte(marcaId: string, desde?: string, hasta?: string): Promise<ReporteArea> {
    const r = resolverRango(desde, hasta);
    const p = rangoPrevio(r);
    const ahora = new Date();
    const [tickets, ticketsPrev, hojas, hojasPrev, hojasPendientes, chats, contactos] = await Promise.all([
      this.prisma.ticket.findMany({ where: { marcaId, createdAt: entre(r) }, select: { createdAt: true, tipo: true, estado: true, prioridad: true, resueltoAt: true }, take: 20000 }),
      this.prisma.ticket.count({ where: { marcaId, createdAt: entre(p) } }),
      this.prisma.hojaReclamacion.findMany({ where: { marcaId, createdAt: entre(r) }, select: { createdAt: true, estado: true, tipo: true, respondidoAt: true }, take: 20000 }),
      this.prisma.hojaReclamacion.count({ where: { marcaId, createdAt: entre(p) } }),
      this.prisma.hojaReclamacion.count({ where: { marcaId, estado: { not: 'RESPONDIDO' }, fechaLimite: { lt: ahora } } }),
      this.prisma.chatConversacion.findMany({ where: { marcaId, createdAt: entre(r) }, select: { createdAt: true, estado: true }, take: 20000 }),
      this.prisma.contactoWeb.findMany({ where: { marcaId, createdAt: entre(r), tipo: { not: 'CONTACTO' } }, select: { createdAt: true, tipo: true, estado: true }, take: 20000 }),
    ]);
    const resueltos = tickets.filter((t) => t.resueltoAt);
    const horas = resueltos.reduce((s, t) => s + (t.resueltoAt!.getTime() - t.createdAt.getTime()) / 3_600_000, 0);
    const abiertos = tickets.filter((t) => t.estado !== 'RESUELTO' && t.estado !== 'CERRADO').length;
    const respondidas = hojas.filter((h) => h.estado === 'RESPONDIDO');

    return {
      area: 'soporte',
      rango: rangoDe(r),
      kpis: [
        { clave: 'tickets', label: 'Tickets recibidos', valor: tickets.length, previo: ticketsPrev, formato: 'num' },
        { clave: 'abiertos', label: 'Tickets sin resolver', valor: abiertos, formato: 'num' },
        { clave: 'resolucion', label: 'Resolución promedio (horas)', valor: resueltos.length ? r2(horas / resueltos.length) : 0, formato: 'num' },
        { clave: 'tasaResueltos', label: 'Tickets resueltos', valor: porcentaje(resueltos.length, tickets.length), formato: 'pct' },
        { clave: 'reclamos', label: 'Hojas de reclamación', valor: hojas.length, previo: hojasPrev, formato: 'num' },
        { clave: 'vencidas', label: 'Reclamos vencidos (hoy)', valor: hojasPendientes, formato: 'num' },
        { clave: 'chats', label: 'Conversaciones de chat', valor: chats.length, formato: 'num' },
      ],
      serie: {
        titulo: 'Atención por día',
        etiquetas: etiquetasDias(r),
        series: [
          { nombre: 'Tickets', datos: contarPorDia(tickets.map((t) => t.createdAt), r) },
          { nombre: 'Reclamos', datos: contarPorDia(hojas.map((h) => h.createdAt), r) },
          { nombre: 'Chats', datos: contarPorDia(chats.map((c) => c.createdAt), r) },
        ],
      },
      tablas: [
        { titulo: 'Tickets por estado', columnas: ['Estado', 'Tickets'], filas: ranking(tickets.map((t) => t.estado), 'Sin estado', 20) },
        { titulo: 'Tickets por tipo', columnas: ['Tipo', 'Tickets'], filas: ranking(tickets.map((t) => t.tipo)) },
        { titulo: 'Tickets por prioridad', columnas: ['Prioridad', 'Tickets'], filas: ranking(tickets.map((t) => t.prioridad)) },
        { titulo: 'Libro de reclamaciones', subtitulo: `${respondidas.length} respondidas de ${hojas.length}`, columnas: ['Estado', 'Hojas'], filas: ranking(hojas.map((h) => h.estado)) },
        { titulo: 'Reclamos por tipo', columnas: ['Tipo', 'Hojas'], filas: ranking(hojas.map((h) => h.tipo)) },
        { titulo: 'Chats por estado', columnas: ['Estado', 'Conversaciones'], filas: ranking(chats.map((c) => c.estado)) },
        { titulo: 'Reclamos y consultas BBVA (contacto web)', columnas: ['Tipo', 'Casos'], filas: ranking(contactos.map((c) => c.tipo)) },
      ],
    };
  }

  // ───────────────────────── Finanzas ─────────────────────────
  async finanzas(marcaId: string, desde?: string, hasta?: string): Promise<ReporteArea> {
    const r = resolverRango(desde, hasta);
    const p = rangoPrevio(r);
    const select = { createdAt: true, estado: true, estadoPago: true, metodoPago: true, total: true, igv: true, envio: true } as const;
    const [pedidos, previos, presupuestos, cotizaciones] = await Promise.all([
      this.prisma.pedido.findMany({ where: { marcaId, createdAt: entre(r) }, select, take: 20000 }),
      this.prisma.pedido.findMany({ where: { marcaId, createdAt: entre(p) }, select, take: 20000 }),
      this.prisma.presupuesto.findMany({ where: { marcaId, createdAt: entre(r) }, select: { estado: true, total: true }, take: 20000 }),
      this.prisma.cotizacion.findMany({ where: { marcaId, createdAt: entre(r) }, select: { estado: true, monto: true }, take: 20000 }),
    ]);
    const valida = (x: { estado: string }) => x.estado !== 'CANCELADO';
    const sum = (xs: { total: unknown }[]) => xs.reduce((s, x) => s + Number(x.total), 0);
    const ok = pedidos.filter(valida);
    const okPrev = previos.filter(valida);
    const cobrado = ok.filter((x) => x.estadoPago === 'PAGADO' || ['PAGADO', 'ENVIADO', 'ENTREGADO'].includes(x.estado));
    const porCobrar = ok.filter((x) => !cobrado.includes(x));
    const cobradoPrev = okPrev.filter((x) => x.estadoPago === 'PAGADO' || ['PAGADO', 'ENVIADO', 'ENTREGADO'].includes(x.estado));
    const aceptados = presupuestos.filter((x) => x.estado === 'ACEPTADA');

    const dias = new Map<string, { cobrado: number; porCobrar: number }>();
    for (const d of etiquetasDias(r)) dias.set(d, { cobrado: 0, porCobrar: 0 });
    for (const x of ok) {
      const d = dias.get(diaLima(x.createdAt));
      if (!d) continue;
      if (cobrado.includes(x)) d.cobrado += Number(x.total); else d.porCobrar += Number(x.total);
    }
    const porMetodo = new Map<string, { n: number; total: number }>();
    for (const x of cobrado) {
      const k = x.metodoPago ?? 'Sin definir';
      const m = porMetodo.get(k) ?? { n: 0, total: 0 };
      m.n += 1; m.total += Number(x.total);
      porMetodo.set(k, m);
    }
    const monto = (xs: { estado: string; total: unknown }[], e: string) => r2(sum(xs.filter((x) => x.estado === e)));

    return {
      area: 'finanzas',
      rango: rangoDe(r),
      kpis: [
        { clave: 'facturado', label: 'Ventas (sin cancelados)', valor: r2(sum(ok)), previo: r2(sum(okPrev)), formato: 'usd' },
        { clave: 'cobrado', label: 'Cobrado', valor: r2(sum(cobrado)), previo: r2(sum(cobradoPrev)), formato: 'usd' },
        { clave: 'porCobrar', label: 'Por cobrar', valor: r2(sum(porCobrar)), formato: 'usd' },
        { clave: 'cobranza', label: 'Tasa de cobranza', valor: porcentaje(sum(cobrado), sum(ok)), formato: 'pct' },
        { clave: 'igv', label: 'IGV incluido', valor: r2(ok.reduce((s, x) => s + Number(x.igv), 0)), formato: 'usd' },
        { clave: 'envios', label: 'Envíos cobrados', valor: r2(ok.reduce((s, x) => s + Number(x.envio), 0)), formato: 'usd' },
        { clave: 'presupuestos', label: 'Presupuestos aceptados', valor: r2(sum(aceptados)), formato: 'usd' },
        { clave: 'cancelados', label: 'Pedidos cancelados', valor: pedidos.length - ok.length, formato: 'num' },
      ],
      serie: {
        titulo: 'Cobrado y por cobrar por día (USD)',
        etiquetas: [...dias.keys()],
        series: [
          { nombre: 'Cobrado', datos: [...dias.values()].map((d) => r2(d.cobrado)) },
          { nombre: 'Por cobrar', datos: [...dias.values()].map((d) => r2(d.porCobrar)) },
        ],
      },
      tablas: [
        { titulo: 'Cobrado por medio de pago', columnas: ['Medio', 'Pedidos', 'Total'], filas: [...porMetodo.entries()].sort((a, b) => b[1].total - a[1].total).map(([k, v]) => [k, v.n, r2(v.total)]) },
        { titulo: 'Pedidos por estado', columnas: ['Estado', 'Pedidos', 'Total'], filas: ranking(pedidos.map((x) => x.estado), 'Sin estado', 10).map(([e, n]) => [e, n, monto(pedidos, e)]) },
        { titulo: 'Presupuestos por estado', columnas: ['Estado', 'Presupuestos', 'Total'], filas: ranking(presupuestos.map((x) => x.estado), 'Sin estado', 10).map(([e, n]) => [e, n, monto(presupuestos, e)]) },
        { titulo: 'Cotizaciones con propuesta', subtitulo: 'Monto de las que tienen precio', columnas: ['Estado', 'Cotizaciones', 'Monto'], filas: ranking(cotizaciones.map((x) => x.estado), 'Sin estado', 10).map(([e, n]) => [e, n, r2(cotizaciones.filter((x) => x.estado === e).reduce((s, x) => s + Number(x.monto ?? 0), 0))]) },
      ],
    };
  }

  // ───────────────────────── Dirección ─────────────────────────
  /** Resumen ejecutivo: un indicador clave por área, con comparación contra el periodo anterior. */
  async direccion(marcaId: string, desde?: string, hasta?: string): Promise<ReporteArea> {
    const r = resolverRango(desde, hasta);
    const p = rangoPrevio(r);
    const ahora = new Date();
    const periodo = async (x: Rango) => {
      const createdAt = entre(x);
      const [pedidos, visitas, leads, ops, tickets, hojas, suscriptores] = await Promise.all([
        this.prisma.pedido.findMany({ where: { marcaId, createdAt, estado: { not: 'CANCELADO' } }, select: { createdAt: true, total: true }, take: 20000 }),
        this.prisma.visitaWeb.count({ where: { marcaId, createdAt, origen: { not: 'interno' } } }),
        this.leads(marcaId, x),
        this.prisma.crmOportunidad.findMany({ where: { marcaId, createdAt }, select: { etapa: true, monto: true }, take: 20000 }),
        this.prisma.ticket.count({ where: { marcaId, createdAt } }),
        this.prisma.hojaReclamacion.count({ where: { marcaId, createdAt } }),
        this.prisma.suscriptorBoletin.count({ where: { marcaId, createdAt } }),
      ]);
      const ganadas = ops.filter((o) => o.etapa === 'GANADO');
      return {
        pedidos, visitas, leads, ganadas, tickets, hojas, suscriptores,
        ventas: pedidos.reduce((s, x) => s + Number(x.total), 0),
        montoGanado: ganadas.reduce((s, o) => s + Number(o.monto ?? 0), 0),
      };
    };
    const [a, b, vencidas] = await Promise.all([
      periodo(r),
      periodo(p),
      this.prisma.hojaReclamacion.count({ where: { marcaId, estado: { not: 'RESPONDIDO' }, fechaLimite: { lt: ahora } } }),
    ]);
    const ticketsAbiertos = await this.prisma.ticket.count({ where: { marcaId, estado: { notIn: ['RESUELTO', 'CERRADO'] } } });

    return {
      area: 'direccion',
      rango: rangoDe(r),
      kpis: [
        { clave: 'ventas', label: 'Ventas de la tienda', valor: r2(a.ventas), previo: r2(b.ventas), formato: 'usd' },
        { clave: 'pedidos', label: 'Pedidos válidos', valor: a.pedidos.length, previo: b.pedidos.length, formato: 'num' },
        { clave: 'visitas', label: 'Visitas a la web', valor: a.visitas, previo: b.visitas, formato: 'num' },
        { clave: 'leads', label: 'Leads totales', valor: a.leads.total, previo: b.leads.total, formato: 'num' },
        { clave: 'montoGanado', label: 'Monto ganado (CRM)', valor: r2(a.montoGanado), previo: r2(b.montoGanado), formato: 'usd' },
        { clave: 'suscriptores', label: 'Suscriptores nuevos', valor: a.suscriptores, previo: b.suscriptores, formato: 'num' },
        { clave: 'tickets', label: 'Tickets recibidos', valor: a.tickets, previo: b.tickets, formato: 'num' },
        { clave: 'vencidas', label: 'Reclamos vencidos (hoy)', valor: vencidas, formato: 'num' },
      ],
      serie: {
        titulo: 'Actividad por día',
        etiquetas: etiquetasDias(r),
        series: [
          { nombre: 'Pedidos', datos: contarPorDia(a.pedidos.map((x) => x.createdAt), r) },
          { nombre: 'Leads', datos: contarPorDia(a.leads.fechas, r) },
        ],
      },
      tablas: [
        {
          titulo: 'Resumen por área',
          columnas: ['Área', 'Indicador', 'Periodo', 'Anterior'],
          filas: [
            ['Ventas', 'Ventas (USD)', r2(a.ventas), r2(b.ventas)],
            ['Marketing', 'Visitas', a.visitas, b.visitas],
            ['Marketing', 'Conversión visita → lead (%)', porcentaje(a.leads.total, a.visitas), porcentaje(b.leads.total, b.visitas)],
            ['Comercial', 'Leads', a.leads.total, b.leads.total],
            ['Comercial', 'Oportunidades ganadas', a.ganadas.length, b.ganadas.length],
            ['Soporte', 'Tickets', a.tickets, b.tickets],
            ['Soporte', 'Hojas de reclamación', a.hojas, b.hojas],
            ['Soporte', 'Tickets sin resolver (hoy)', ticketsAbiertos, ticketsAbiertos],
          ],
        },
      ],
    };
  }
}
