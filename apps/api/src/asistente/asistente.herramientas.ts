/*
 * Herramientas (function calling) del asistente del dashboard. Cada una:
 *   - declara los roles que la pueden usar: los MISMOS @Roles del módulo del dashboard que lee (pedidos y reportes →
 *     ventas; leads, tickets, reclamos y contactos → comercial; cotizaciones y presupuestos → comercial/ventas; chats →
 *     asesores). `admin` puede todas. Una herramienta fuera del rol ni se ofrece al modelo ni se ejecuta.
 *   - consulta SIEMPRE con el `marcaId` de la marca activa (doble candado con el tenant-guard de Prisma).
 *   - devuelve un texto compacto para el modelo y, para la pantalla, la tabla/métricas tal cual salen de la base
 *     (el modelo no escribe cifras: las cifras que ve el usuario son estas).
 */
import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { ReportesService } from '../reportes/reportes.service.js';
import type { ConocimientoService } from '../conocimiento/conocimiento.service.js';
import { diaLima, resolverRango } from '../reportes/reportes.service.js';
import { inicioDiaLima, sumarDiasHabiles } from '../libro-reclamaciones/dias-habiles.js';

export const MAX_FILAS = 25;

export interface Metrica { etiqueta: string; valor: number; formato: 'numero' | 'moneda'; moneda?: string; modulo?: string; detalle?: string }
export interface Tabla { titulo: string; modulo: string; columnas: string[]; filas: (string | number | null)[][]; total?: number }
export interface Resultado { paraIA: unknown; tabla?: Tabla; metricas?: Metrica[] }

export interface Contexto {
  prisma: PrismaService;
  reportes: ReportesService;
  conocimiento: ConocimientoService;
  marcaId: string;
  rol: string;
}

type Args = Record<string, unknown>;

export interface Herramienta {
  nombre: string;
  descripcion: string;
  /** JSON Schema de los argumentos. */
  parametros: Record<string, unknown>;
  /** null = cualquier rol de la marca. */
  roles: string[] | null;
  ejecutar(ctx: Contexto, args: Args): Promise<Resultado>;
}

export const puede = (roles: string[] | null, rol: string) => !roles || rol === 'admin' || roles.includes(rol);

// ------------------------------------------------------------------ utilidades

const n = (v: unknown) => Math.round(Number(v ?? 0) * 100) / 100;
const fecha = (d: Date | null | undefined) => (d ? diaLima(d) : null);
const str = (v: unknown, max = 80) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const corto = (v: string | null | undefined, max = 60) => (v ? (v.length > max ? `${v.slice(0, max - 1)}…` : v) : null);

/** Rango opcional: solo si llega alguna fecha (YYYY-MM-DD, días de Lima). */
function rangoDe(args: Args) {
  const desde = str(args.desde, 10) || undefined;
  const hasta = str(args.hasta, 10) || undefined;
  if (!desde && !hasta) return null;
  const r = resolverRango(desde, hasta);
  return { gte: r.desde, lte: r.hasta };
}

/** OR de `contains` sin distinguir mayúsculas sobre los campos dados. */
function texto(args: Args, campos: string[]) {
  const t = str(args.texto);
  return t ? { OR: campos.map((c) => ({ [c]: { contains: t, mode: 'insensitive' as const } })) } : {};
}

function estado<T extends string>(args: Args, validos: readonly T[]): { estado?: T } {
  const e = str(args.estado, 30).toUpperCase() as T;
  if (!e) return {};
  if (!validos.includes(e)) throw new BadRequestException(`Estado no válido: usa ${validos.join(', ')}`);
  return { estado: e };
}

const P_RANGO = {
  desde: { type: 'string', description: 'Fecha inicial YYYY-MM-DD (opcional)' },
  hasta: { type: 'string', description: 'Fecha final YYYY-MM-DD (opcional)' },
};
const P_TEXTO = { texto: { type: 'string', description: 'Texto a buscar (nombre, correo, número, etc.). Opcional' } };
const objeto = (props: Record<string, unknown>) => ({ type: 'object', properties: props, additionalProperties: false });

const ESTADOS_PEDIDO = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'] as const;
const ESTADOS_COTIZACION = ['PENDIENTE', 'EN_REVISION', 'ENVIADA', 'ACEPTADA', 'RECHAZADA'] as const;
const ESTADOS_LEAD = ['NUEVO', 'CONTACTADO', 'COTIZADO', 'GANADO', 'PERDIDO'] as const;
const ESTADOS_TICKET = ['NUEVO', 'EN_REVISION', 'ESPERANDO_CLIENTE', 'RESUELTO', 'CERRADO'] as const;
const ESTADOS_HOJA = ['RECIBIDO', 'EN_PROCESO', 'RESPONDIDO'] as const;
const ESTADOS_CONTACTO = ['NUEVO', 'CONTACTADO', 'RESUELTO', 'DESCARTADO'] as const;
const ESTADOS_CHAT = ['BOT', 'ASESOR', 'CERRADA'] as const;

const R = {
  ventas: ['ventas'],
  comercial: ['comercial'],
  comercialVentas: ['comercial', 'ventas'],
  asesores: ['asesores'],
};

/** Tabla → texto compacto para el modelo (mismas filas que ve el usuario). */
const paraIA = (t: Tabla) => ({ titulo: t.titulo, total: t.total ?? t.filas.length, columnas: t.columnas, filas: t.filas });

// ------------------------------------------------------------------ herramientas

const resumenNegocio: Herramienta = {
  nombre: 'resumen_negocio',
  descripcion:
    'Resumen general de la marca en un periodo (por defecto los últimos 30 días): ventas y pedidos, cotizaciones, presupuestos, leads, tickets, reclamos, contactos, chats y stock bajo — solo lo que el rol del usuario puede ver. Úsala para "cómo vamos", "resumen", "qué hay pendiente".',
  parametros: objeto(P_RANGO),
  roles: null,
  async ejecutar(ctx, args) {
    const { prisma, marcaId, rol } = ctx;
    const r = resolverRango(str(args.desde, 10) || undefined, str(args.hasta, 10) || undefined);
    const createdAt = { gte: r.desde, lte: r.hasta };
    const metricas: Metrica[] = [];
    const tareas: Promise<void>[] = [];

    if (puede(R.ventas, rol)) {
      tareas.push(
        (async () => {
          const [venta, pedidos, pendientes, stockBajo] = await Promise.all([
            prisma.pedido.aggregate({ where: { marcaId, createdAt, estado: { not: 'CANCELADO' } }, _sum: { total: true }, _count: true }),
            prisma.pedido.count({ where: { marcaId, createdAt } }),
            prisma.pedido.count({ where: { marcaId, estado: 'PENDIENTE' } }),
            prisma.producto.count({ where: { marcaId, activo: true, stock: { lte: 5 } } }),
          ]);
          metricas.push(
            { etiqueta: 'Ventas del periodo', valor: n(venta._sum.total), formato: 'moneda', moneda: 'USD', modulo: 'reportes.ventas' },
            { etiqueta: 'Pedidos del periodo', valor: pedidos, formato: 'numero', modulo: 'ecommerce.pedidos' },
            { etiqueta: 'Pedidos pendientes (todos)', valor: pendientes, formato: 'numero', modulo: 'ecommerce.pedidos' },
            { etiqueta: 'Productos con stock ≤ 5', valor: stockBajo, formato: 'numero', modulo: 'ecommerce.productos' },
          );
        })(),
      );
    }
    if (puede(R.comercialVentas, rol)) {
      tareas.push(
        (async () => {
          const [cot, cotAbiertas, pres, presAbiertos] = await Promise.all([
            prisma.cotizacion.count({ where: { marcaId, createdAt } }),
            prisma.cotizacion.count({ where: { marcaId, estado: { in: ['PENDIENTE', 'EN_REVISION'] } } }),
            prisma.presupuesto.count({ where: { marcaId, createdAt } }),
            prisma.presupuesto.count({ where: { marcaId, estado: { in: ['PENDIENTE', 'EN_REVISION'] } } }),
          ]);
          metricas.push(
            { etiqueta: 'Cotizaciones del periodo', valor: cot, formato: 'numero', modulo: 'soluciones.cotizaciones' },
            { etiqueta: 'Cotizaciones por atender', valor: cotAbiertas, formato: 'numero', modulo: 'soluciones.cotizaciones' },
            { etiqueta: 'Presupuestos del periodo', valor: pres, formato: 'numero', modulo: 'ecommerce.presupuestos' },
            { etiqueta: 'Presupuestos por atender', valor: presAbiertos, formato: 'numero', modulo: 'ecommerce.presupuestos' },
          );
        })(),
      );
    }
    if (puede(R.comercial, rol)) {
      tareas.push(
        (async () => {
          const ahora = new Date();
          const [leads, leadsNuevos, tickets, contactos, vencidas, porVencer, sinResponder] = await Promise.all([
            prisma.leadCotizador.count({ where: { marcaId, createdAt } }),
            prisma.leadCotizador.count({ where: { marcaId, estado: 'NUEVO' } }),
            prisma.ticket.count({ where: { marcaId, estado: { in: ['NUEVO', 'EN_REVISION', 'ESPERANDO_CLIENTE'] } } }),
            prisma.contactoWeb.count({ where: { marcaId, estado: 'NUEVO' } }),
            prisma.hojaReclamacion.count({ where: { marcaId, estado: { not: 'RESPONDIDO' }, fechaLimite: { lt: ahora } } }),
            prisma.hojaReclamacion.count({
              where: { marcaId, estado: { not: 'RESPONDIDO' }, fechaLimite: { gte: ahora, lt: inicioDiaLima(sumarDiasHabiles(ahora, 4)) } },
            }),
            prisma.hojaReclamacion.count({ where: { marcaId, estado: { not: 'RESPONDIDO' } } }),
          ]);
          metricas.push(
            { etiqueta: 'Leads del periodo', valor: leads, formato: 'numero', modulo: 'cotizador.leads' },
            { etiqueta: 'Leads sin contactar', valor: leadsNuevos, formato: 'numero', modulo: 'cotizador.leads' },
            { etiqueta: 'Tickets abiertos', valor: tickets, formato: 'numero', modulo: 'web.tickets' },
            { etiqueta: 'Contactos nuevos', valor: contactos, formato: 'numero', modulo: 'web.contactos' },
            { etiqueta: 'Reclamos sin responder', valor: sinResponder, formato: 'numero', modulo: 'libro.bandeja', detalle: `${vencidas} vencidos, ${porVencer} por vencer` },
          );
        })(),
      );
    }
    if (puede(R.asesores, rol)) {
      tareas.push(
        (async () => {
          const [conAsesor, delPeriodo] = await Promise.all([
            prisma.chatConversacion.count({ where: { marcaId, estado: 'ASESOR' } }),
            prisma.chatConversacion.count({ where: { marcaId, createdAt } }),
          ]);
          metricas.push(
            { etiqueta: 'Chats con asesor abiertos', valor: conAsesor, formato: 'numero', modulo: 'chat.conversaciones' },
            { etiqueta: 'Chats del periodo', valor: delPeriodo, formato: 'numero', modulo: 'chat.conversaciones' },
          );
        })(),
      );
    }
    await Promise.all(tareas);
    return {
      paraIA: { periodo: { desde: diaLima(r.desde), hasta: diaLima(r.hasta) }, metricas: metricas.map((m) => ({ [m.etiqueta]: m.valor, ...(m.detalle ? { detalle: m.detalle } : {}) })) },
      metricas,
    };
  },
};

const reporteVentas: Herramienta = {
  nombre: 'reporte_ventas',
  descripcion:
    'Reporte de ventas de la tienda en un periodo (por defecto últimos 30 días): ventas, pedidos, ticket promedio, por cobrar, comparación con el periodo anterior, top productos y top clientes.',
  parametros: objeto(P_RANGO),
  roles: R.ventas,
  async ejecutar(ctx, args) {
    const rep = await ctx.reportes.ventas(ctx.marcaId, str(args.desde, 10) || undefined, str(args.hasta, 10) || undefined);
    const k = rep.kpis;
    const variacion = k.ventasPrevias ? Math.round(((k.ventas - k.ventasPrevias) / k.ventasPrevias) * 1000) / 10 : null;
    const tabla: Tabla = {
      titulo: `Productos más vendidos (${rep.rango.desde} a ${rep.rango.hasta})`,
      modulo: 'reportes.ventas',
      columnas: ['SKU', 'Producto', 'Unidades', 'Total USD'],
      filas: rep.topProductos.map((p) => [p.sku, p.nombre, p.unidades, p.total]),
    };
    return {
      paraIA: { rango: rep.rango, kpis: k, variacionVentasPct: variacion, porEstado: rep.porEstado, topProductos: rep.topProductos.slice(0, 5), topClientes: rep.topClientes.slice(0, 5).map((c) => ({ nombre: c.nombre, pedidos: c.pedidos, total: c.total })) },
      metricas: [
        { etiqueta: 'Ventas', valor: k.ventas, formato: 'moneda', moneda: 'USD', modulo: 'reportes.ventas', detalle: variacion === null ? undefined : `${variacion > 0 ? '+' : ''}${variacion}% vs periodo anterior` },
        { etiqueta: 'Pedidos válidos', valor: k.pedidosValidos, formato: 'numero', modulo: 'ecommerce.pedidos' },
        { etiqueta: 'Ticket promedio', valor: k.ticketPromedio, formato: 'moneda', moneda: 'USD' },
        { etiqueta: 'Por cobrar', valor: k.porCobrar, formato: 'moneda', moneda: 'USD', modulo: 'ecommerce.pedidos' },
      ],
      tabla,
    };
  },
};

const buscarProductos: Herramienta = {
  nombre: 'buscar_productos',
  descripcion: 'Busca productos del catálogo de la marca por nombre, SKU o marca comercial; puede filtrar los de stock bajo (≤5) o sin stock.',
  parametros: objeto({ ...P_TEXTO, stock_bajo: { type: 'boolean', description: 'Solo productos activos con stock ≤ 5' }, sin_stock: { type: 'boolean', description: 'Solo productos con stock 0' } }),
  roles: R.ventas,
  async ejecutar({ prisma, marcaId }, args) {
    const where = {
      marcaId,
      ...texto(args, ['nombre', 'sku', 'marcaComercial']),
      ...(args.sin_stock === true ? { stock: { lte: 0 } } : args.stock_bajo === true ? { stock: { lte: 5 }, activo: true } : {}),
    };
    const [filas, total] = await Promise.all([
      prisma.producto.findMany({
        where, take: MAX_FILAS, orderBy: args.stock_bajo || args.sin_stock ? { stock: 'asc' } : { updatedAt: 'desc' },
        select: { sku: true, nombre: true, marcaComercial: true, precio: true, precioMayorista: true, stock: true, activo: true, categoria: { select: { nombre: true } } },
      }),
      prisma.producto.count({ where }),
    ]);
    const tabla: Tabla = {
      titulo: 'Productos', modulo: 'ecommerce.productos', total,
      columnas: ['SKU', 'Producto', 'Marca', 'Categoría', 'Precio USD', 'Mayorista USD', 'Stock', 'Activo'],
      filas: filas.map((p) => [p.sku, corto(p.nombre, 70), p.marcaComercial, p.categoria?.nombre ?? null, n(p.precio), p.precioMayorista == null ? null : n(p.precioMayorista), p.stock, p.activo ? 'Sí' : 'No']),
    };
    return { paraIA: paraIA(tabla), tabla };
  },
};

const buscarPedidos: Herramienta = {
  nombre: 'buscar_pedidos',
  descripcion: 'Busca pedidos de la tienda por cliente, correo o número; filtra por estado y fechas. Devuelve también el total sumado.',
  parametros: objeto({ ...P_TEXTO, estado: { type: 'string', enum: [...ESTADOS_PEDIDO] }, ...P_RANGO }),
  roles: R.ventas,
  async ejecutar({ prisma, marcaId }, args) {
    const rango = rangoDe(args);
    const where = { marcaId, ...texto(args, ['nombre', 'email', 'numeroPedido', 'documento']), ...estado(args, ESTADOS_PEDIDO), ...(rango ? { createdAt: rango } : {}) };
    const [filas, agg] = await Promise.all([
      prisma.pedido.findMany({ where, take: MAX_FILAS, orderBy: { createdAt: 'desc' }, select: { numeroPedido: true, createdAt: true, nombre: true, estado: true, estadoPago: true, total: true, moneda: true } }),
      prisma.pedido.aggregate({ where, _sum: { total: true }, _count: true }),
    ]);
    const tabla: Tabla = {
      titulo: 'Pedidos', modulo: 'ecommerce.pedidos', total: agg._count,
      columnas: ['N.°', 'Fecha', 'Cliente', 'Estado', 'Pago', 'Total'],
      filas: filas.map((p) => [p.numeroPedido, fecha(p.createdAt), p.nombre, p.estado, p.estadoPago, n(p.total)]),
    };
    return {
      paraIA: { ...paraIA(tabla), sumaTotal: n(agg._sum.total) },
      tabla,
      metricas: [
        { etiqueta: 'Pedidos encontrados', valor: agg._count, formato: 'numero', modulo: 'ecommerce.pedidos' },
        { etiqueta: 'Suma de esos pedidos', valor: n(agg._sum.total), formato: 'moneda', moneda: filas[0]?.moneda ?? 'USD' },
      ],
    };
  },
};

const buscarCotizaciones: Herramienta = {
  nombre: 'buscar_cotizaciones',
  descripcion: 'Busca solicitudes de cotización de servicios TI por cliente, empresa, correo o número; filtra por estado y fechas.',
  parametros: objeto({ ...P_TEXTO, estado: { type: 'string', enum: [...ESTADOS_COTIZACION] }, ...P_RANGO }),
  roles: R.comercialVentas,
  async ejecutar({ prisma, marcaId }, args) {
    const rango = rangoDe(args);
    const where = { marcaId, ...texto(args, ['clienteNombre', 'clienteEmpresa', 'clienteEmail', 'numero']), ...estado(args, ESTADOS_COTIZACION), ...(rango ? { createdAt: rango } : {}) };
    const [filas, total] = await Promise.all([
      prisma.cotizacion.findMany({ where, take: MAX_FILAS, orderBy: { createdAt: 'desc' }, select: { numero: true, createdAt: true, clienteNombre: true, clienteEmpresa: true, estado: true, monto: true, moneda: true, servicio: { select: { nombre: true } } } }),
      prisma.cotizacion.count({ where }),
    ]);
    const tabla: Tabla = {
      titulo: 'Cotizaciones de servicios', modulo: 'soluciones.cotizaciones', total,
      columnas: ['N.°', 'Fecha', 'Cliente', 'Empresa', 'Servicio', 'Estado', 'Monto'],
      filas: filas.map((c) => [c.numero, fecha(c.createdAt), c.clienteNombre, c.clienteEmpresa, c.servicio.nombre, c.estado, c.monto == null ? null : `${c.moneda} ${n(c.monto)}`]),
    };
    return { paraIA: paraIA(tabla), tabla };
  },
};

const buscarPresupuestos: Herramienta = {
  nombre: 'buscar_presupuestos',
  descripcion: 'Busca presupuestos mayoristas de productos por cliente, correo o número; filtra por estado y fechas.',
  parametros: objeto({ ...P_TEXTO, estado: { type: 'string', enum: [...ESTADOS_COTIZACION] }, ...P_RANGO }),
  roles: R.comercialVentas,
  async ejecutar({ prisma, marcaId }, args) {
    const rango = rangoDe(args);
    const where = { marcaId, ...texto(args, ['clienteNombre', 'clienteEmail', 'numero']), ...estado(args, ESTADOS_COTIZACION), ...(rango ? { createdAt: rango } : {}) };
    const [filas, agg] = await Promise.all([
      prisma.presupuesto.findMany({ where, take: MAX_FILAS, orderBy: { createdAt: 'desc' }, select: { numero: true, createdAt: true, clienteNombre: true, estado: true, total: true, moneda: true, validezHasta: true } }),
      prisma.presupuesto.aggregate({ where, _sum: { total: true }, _count: true }),
    ]);
    const tabla: Tabla = {
      titulo: 'Presupuestos mayoristas', modulo: 'ecommerce.presupuestos', total: agg._count,
      columnas: ['N.°', 'Fecha', 'Cliente', 'Estado', 'Total', 'Válido hasta'],
      filas: filas.map((p) => [p.numero, fecha(p.createdAt), p.clienteNombre, p.estado, `${p.moneda} ${n(p.total)}`, fecha(p.validezHasta)]),
    };
    return { paraIA: { ...paraIA(tabla), sumaTotal: n(agg._sum.total) }, tabla };
  },
};

const buscarLeads: Herramienta = {
  nombre: 'buscar_leads',
  descripcion: 'Busca leads del formulario cotizador de la web por nombre, empresa, correo, documento o interés; filtra por estado y fechas.',
  parametros: objeto({ ...P_TEXTO, estado: { type: 'string', enum: [...ESTADOS_LEAD] }, ...P_RANGO }),
  roles: R.comercial,
  async ejecutar({ prisma, marcaId }, args) {
    const rango = rangoDe(args);
    const where = { marcaId, ...texto(args, ['nombres', 'apellidos', 'empresa', 'email', 'nroDocumento', 'interes']), ...estado(args, ESTADOS_LEAD), ...(rango ? { createdAt: rango } : {}) };
    const [filas, total] = await Promise.all([
      prisma.leadCotizador.findMany({ where, take: MAX_FILAS, orderBy: { createdAt: 'desc' }, select: { createdAt: true, nombres: true, apellidos: true, empresa: true, interes: true, estado: true, email: true, celular: true } }),
      prisma.leadCotizador.count({ where }),
    ]);
    const tabla: Tabla = {
      titulo: 'Leads del cotizador', modulo: 'cotizador.leads', total,
      columnas: ['Fecha', 'Nombre', 'Empresa', 'Interés', 'Estado', 'Correo', 'Celular'],
      filas: filas.map((l) => [fecha(l.createdAt), `${l.nombres} ${l.apellidos}`, l.empresa, l.interes, l.estado, l.email, l.celular]),
    };
    return { paraIA: paraIA(tabla), tabla };
  },
};

const buscarTickets: Herramienta = {
  nombre: 'buscar_tickets',
  descripcion: 'Busca tickets de soporte de clientes (reclamo, verificación, soporte) por número, cliente, correo o producto; filtra por estado y fechas.',
  parametros: objeto({ ...P_TEXTO, estado: { type: 'string', enum: [...ESTADOS_TICKET] }, ...P_RANGO }),
  roles: R.comercial,
  async ejecutar({ prisma, marcaId }, args) {
    const rango = rangoDe(args);
    const where = { marcaId, ...texto(args, ['numero', 'nombre', 'email', 'producto']), ...estado(args, ESTADOS_TICKET), ...(rango ? { createdAt: rango } : {}) };
    const [filas, total] = await Promise.all([
      prisma.ticket.findMany({ where, take: MAX_FILAS, orderBy: { createdAt: 'desc' }, select: { numero: true, createdAt: true, tipo: true, nombre: true, producto: true, estado: true, prioridad: true, asignadoA: true } }),
      prisma.ticket.count({ where }),
    ]);
    const tabla: Tabla = {
      titulo: 'Tickets de soporte', modulo: 'web.tickets', total,
      columnas: ['N.°', 'Fecha', 'Tipo', 'Cliente', 'Producto', 'Estado', 'Prioridad', 'Asignado'],
      filas: filas.map((t) => [t.numero, fecha(t.createdAt), t.tipo, t.nombre, corto(t.producto), t.estado, t.prioridad, t.asignadoA]),
    };
    return { paraIA: paraIA(tabla), tabla };
  },
};

const buscarReclamos: Herramienta = {
  nombre: 'buscar_reclamos',
  descripcion: 'Busca hojas del libro de reclamaciones por código, consumidor o documento; filtra por estado, solo vencidas y fechas. Plazo legal: 15 días hábiles.',
  parametros: objeto({ ...P_TEXTO, estado: { type: 'string', enum: [...ESTADOS_HOJA] }, vencidas: { type: 'boolean', description: 'Solo las no respondidas cuyo plazo ya venció' }, ...P_RANGO }),
  roles: R.comercial,
  async ejecutar({ prisma, marcaId }, args) {
    const rango = rangoDe(args);
    const ahora = new Date();
    const where = {
      marcaId, ...texto(args, ['codigo', 'nombres', 'apellidos', 'nroDocumento', 'email']), ...estado(args, ESTADOS_HOJA),
      ...(args.vencidas === true ? { estado: { not: 'RESPONDIDO' as const }, fechaLimite: { lt: ahora } } : {}),
      ...(rango ? { createdAt: rango } : {}),
    };
    const [filas, total] = await Promise.all([
      prisma.hojaReclamacion.findMany({ where, take: MAX_FILAS, orderBy: { fecha: 'desc' }, select: { codigo: true, fecha: true, nombres: true, apellidos: true, tipo: true, estado: true, fechaLimite: true } }),
      prisma.hojaReclamacion.count({ where }),
    ]);
    const tabla: Tabla = {
      titulo: 'Libro de reclamaciones', modulo: 'libro.bandeja', total,
      columnas: ['Código', 'Fecha', 'Consumidor', 'Tipo', 'Estado', 'Fecha límite', 'Vencida'],
      filas: filas.map((h) => [h.codigo, fecha(h.fecha), `${h.nombres} ${h.apellidos}`, h.tipo, h.estado, fecha(h.fechaLimite), h.estado !== 'RESPONDIDO' && h.fechaLimite < ahora ? 'Sí' : 'No']),
    };
    return { paraIA: paraIA(tabla), tabla };
  },
};

const buscarContactos: Herramienta = {
  nombre: 'buscar_contactos',
  descripcion: 'Busca mensajes del formulario de contacto de la web por nombre, correo, empresa o texto; filtra por estado y fechas.',
  parametros: objeto({ ...P_TEXTO, estado: { type: 'string', enum: [...ESTADOS_CONTACTO] }, ...P_RANGO }),
  roles: R.comercial,
  async ejecutar({ prisma, marcaId }, args) {
    const rango = rangoDe(args);
    const where = { marcaId, ...texto(args, ['nombre', 'email', 'empresa', 'mensaje']), ...estado(args, ESTADOS_CONTACTO), ...(rango ? { createdAt: rango } : {}) };
    const [filas, total] = await Promise.all([
      prisma.contactoWeb.findMany({ where, take: MAX_FILAS, orderBy: { createdAt: 'desc' }, select: { createdAt: true, tipo: true, nombre: true, empresa: true, estado: true, mensaje: true } }),
      prisma.contactoWeb.count({ where }),
    ]);
    const tabla: Tabla = {
      titulo: 'Contactos de la web', modulo: 'web.contactos', total,
      columnas: ['Fecha', 'Tipo', 'Nombre', 'Empresa', 'Estado', 'Mensaje'],
      filas: filas.map((c) => [fecha(c.createdAt), c.tipo, c.nombre, c.empresa, c.estado, corto(c.mensaje, 90)]),
    };
    return { paraIA: paraIA(tabla), tabla };
  },
};

const buscarChats: Herramienta = {
  nombre: 'buscar_chats',
  descripcion: 'Lista conversaciones del chat de la web (asistente o asesor) por estado y fechas, con su último mensaje.',
  parametros: objeto({ estado: { type: 'string', enum: [...ESTADOS_CHAT] }, ...P_RANGO }),
  roles: R.asesores,
  async ejecutar({ prisma, marcaId }, args) {
    const rango = rangoDe(args);
    const where = { marcaId, ...estado(args, ESTADOS_CHAT), ...(rango ? { createdAt: rango } : {}) };
    const [filas, total] = await Promise.all([
      prisma.chatConversacion.findMany({
        where, take: MAX_FILAS, orderBy: { updatedAt: 'desc' },
        select: { titulo: true, estado: true, paginaOrigen: true, updatedAt: true, mensajes: { where: { marcaId }, take: 1, orderBy: { createdAt: 'desc' }, select: { texto: true } } },
      }),
      prisma.chatConversacion.count({ where }),
    ]);
    const tabla: Tabla = {
      titulo: 'Conversaciones del chat', modulo: 'chat.conversaciones', total,
      columnas: ['Actualizada', 'Tema', 'Estado', 'Página', 'Último mensaje'],
      filas: filas.map((c) => [fecha(c.updatedAt), corto(c.titulo), c.estado, c.paginaOrigen, corto(c.mensajes[0]?.texto, 90)]),
    };
    return { paraIA: paraIA(tabla), tabla };
  },
};

const buscarConocimiento: Herramienta = {
  nombre: 'buscar_conocimiento',
  descripcion: 'Busca en los documentos y respuestas oficiales cargados en "Conocimiento del asistente" (políticas, fichas, procesos internos de la marca).',
  parametros: { type: 'object', properties: { pregunta: { type: 'string' } }, required: ['pregunta'], additionalProperties: false },
  roles: null,
  async ejecutar({ conocimiento, marcaId }, args) {
    const pregunta = str(args.pregunta, 300);
    if (!pregunta) return { paraIA: { fragmentos: [] } };
    const frags = await conocimiento.buscar(marcaId, pregunta, 5);
    return { paraIA: { fragmentos: frags.map((f) => ({ titulo: f.titulo, texto: f.texto.slice(0, 800), origen: f.origen })) } };
  },
};

export const HERRAMIENTAS: Herramienta[] = [
  resumenNegocio, reporteVentas, buscarProductos, buscarPedidos, buscarCotizaciones, buscarPresupuestos,
  buscarLeads, buscarTickets, buscarReclamos, buscarContactos, buscarChats, buscarConocimiento,
];

/**
 * Módulos del dashboard a los que el asistente puede llevar (IDs de `apps/admin/src/data/nav-manifest.json`), con los
 * roles que los ven. El dashboard vuelve a validar cada ID contra su manifiesto y el rol antes de mostrar el botón.
 */
export const MODULOS: { id: string; titulo: string; roles: string[] | null }[] = [
  { id: 'panel.resumen', titulo: 'Panel general', roles: null },
  { id: 'reportes.ventas', titulo: 'Reporte de ventas', roles: R.ventas },
  { id: 'ecommerce.productos', titulo: 'Productos', roles: R.ventas },
  { id: 'ecommerce.pedidos', titulo: 'Pedidos', roles: R.ventas },
  { id: 'ecommerce.clientes', titulo: 'Clientes de la tienda', roles: R.ventas },
  { id: 'ecommerce.envios', titulo: 'Envíos', roles: R.ventas },
  { id: 'ecommerce.presupuestos', titulo: 'Presupuestos', roles: R.comercialVentas },
  { id: 'soluciones.cotizaciones', titulo: 'Cotizaciones de servicios', roles: R.comercialVentas },
  { id: 'soluciones.servicios', titulo: 'Servicios', roles: ['ventas', 'marketing'] },
  { id: 'cotizador.leads', titulo: 'Leads del cotizador', roles: R.comercial },
  { id: 'web.tickets', titulo: 'Tickets', roles: R.comercial },
  { id: 'web.contactos', titulo: 'Contactos', roles: R.comercial },
  { id: 'libro.bandeja', titulo: 'Libro de reclamaciones', roles: R.comercial },
  { id: 'chat.conversaciones', titulo: 'Conversaciones del chat', roles: R.asesores },
  { id: 'chat.conocimiento', titulo: 'Conocimiento del asistente', roles: R.asesores },
  { id: 'web.home', titulo: 'Web: página de inicio', roles: ['marketing'] },
  { id: 'web.ajustes', titulo: 'Ajustes del sitio', roles: ['marketing'] },
  { id: 'web.popups', titulo: 'Popups', roles: ['marketing'] },
  { id: 'blogs.lista', titulo: 'Blog', roles: ['marketing'] },
  { id: 'campanas.landings', titulo: 'Landing pages', roles: ['marketing', 'comercial'] },
  { id: 'boletin.suscriptores', titulo: 'Suscriptores del boletín', roles: ['marketing'] },
  { id: 'equipo.usuarios', titulo: 'Usuarios y equipo', roles: ['admin'] },
  { id: 'cuenta.perfil', titulo: 'Mi perfil', roles: null },
];
