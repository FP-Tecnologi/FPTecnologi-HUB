import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const MS_DIA = 24 * 60 * 60 * 1000;
const LIMA_OFFSET_MS = 5 * 60 * 60 * 1000; // América/Lima = UTC-5 (sin horario de verano)
const MAX_DIAS = 366;

/** Día calendario de Lima (YYYY-MM-DD) de un instante. */
export const diaLima = (d: Date) => new Date(d.getTime() - LIMA_OFFSET_MS).toISOString().slice(0, 10);
const r2 = (n: number) => Math.round(n * 100) / 100;

export interface Rango { desde: Date; hasta: Date; dias: number }

/** `desde`/`hasta` llegan como YYYY-MM-DD (días de Lima, ambos inclusive). Por defecto, los últimos 30 días. */
export function resolverRango(desde?: string, hasta?: string, ahora = new Date()): Rango {
  const fin = new Date(`${hasta ?? diaLima(ahora)}T23:59:59.999-05:00`);
  const inicio = new Date(`${desde ?? diaLima(new Date(fin.getTime() - 29 * MS_DIA))}T00:00:00.000-05:00`);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) throw new BadRequestException('Fechas no válidas (usa YYYY-MM-DD)');
  if (inicio > fin) throw new BadRequestException('La fecha inicial es posterior a la final');
  const dias = Math.floor((fin.getTime() - inicio.getTime()) / MS_DIA); // días después del primero: 1 a 3 oct = 2
  if (dias > MAX_DIAS) throw new BadRequestException(`El rango máximo es de ${MAX_DIAS} días`);
  return { desde: inicio, hasta: fin, dias };
}

type Fila = {
  numeroPedido: string | null; nombre: string; email: string; estado: string; estadoPago: string; metodoPago: string | null;
  total: unknown; igv: unknown; envio: unknown; envioProveedor: string | null; envioDepartamento: string | null; createdAt: Date;
  items: { cantidad: number; subtotal: unknown; nombreSnapshot: string; skuSnapshot: string }[];
};

function agrupar<T>(filas: T[], clave: (f: T) => string, valor: (f: T) => number) {
  const m = new Map<string, { n: number; total: number }>();
  for (const f of filas) {
    const k = clave(f);
    const x = m.get(k) ?? { n: 0, total: 0 };
    x.n += 1;
    x.total += valor(f);
    m.set(k, x);
  }
  return [...m.entries()].map(([nombre, v]) => ({ nombre, pedidos: v.n, total: r2(v.total) })).sort((a, b) => b.total - a.total);
}

/** Cálculo puro (testeable) del reporte a partir de las filas de pedidos del rango y del rango anterior. */
export function calcularReporte(filas: Fila[], previas: Fila[], rango: Rango, conDetalle: boolean) {
  const validas = filas.filter((f) => f.estado !== 'CANCELADO');
  const ventas = validas.reduce((s, f) => s + Number(f.total), 0);
  const ventasPrev = previas.filter((f) => f.estado !== 'CANCELADO').reduce((s, f) => s + Number(f.total), 0);
  const unidades = validas.reduce((s, f) => s + f.items.reduce((u, i) => u + i.cantidad, 0), 0);
  const porCobrar = validas.filter((f) => f.estadoPago !== 'PAGADO').reduce((s, f) => s + Number(f.total), 0);

  // Serie diaria (rellena los días sin ventas con 0 para que el gráfico no "salte")
  const dias = new Map<string, { pedidos: number; ventas: number }>();
  for (let i = 0; i <= rango.dias; i++) dias.set(diaLima(new Date(rango.desde.getTime() + i * MS_DIA)), { pedidos: 0, ventas: 0 });
  for (const f of validas) {
    const d = dias.get(diaLima(f.createdAt));
    if (d) { d.pedidos += 1; d.ventas += Number(f.total); }
  }

  const productos = new Map<string, { nombre: string; sku: string; unidades: number; total: number }>();
  for (const f of validas) for (const i of f.items) {
    const k = i.skuSnapshot || i.nombreSnapshot;
    const p = productos.get(k) ?? { nombre: i.nombreSnapshot, sku: i.skuSnapshot, unidades: 0, total: 0 };
    p.unidades += i.cantidad;
    p.total += Number(i.subtotal);
    productos.set(k, p);
  }

  const porEmail = new Map<string, { nombre: string; email: string; pedidos: number; total: number }>();
  for (const f of validas) {
    const k = f.email.toLowerCase();
    const c = porEmail.get(k) ?? { nombre: f.nombre, email: k, pedidos: 0, total: 0 };
    c.pedidos += 1;
    c.total += Number(f.total);
    porEmail.set(k, c);
  }

  return {
    rango: { desde: diaLima(rango.desde), hasta: diaLima(rango.hasta), dias: rango.dias + 1 },
    kpis: {
      pedidos: filas.length,
      pedidosValidos: validas.length,
      cancelados: filas.length - validas.length,
      ventas: r2(ventas),
      ticketPromedio: validas.length ? r2(ventas / validas.length) : 0,
      unidades,
      igv: r2(validas.reduce((s, f) => s + Number(f.igv), 0)),
      envios: r2(validas.reduce((s, f) => s + Number(f.envio), 0)),
      porCobrar: r2(porCobrar),
      ventasPrevias: r2(ventasPrev),
      pedidosPrevios: previas.filter((f) => f.estado !== 'CANCELADO').length,
    },
    porDia: [...dias.entries()].map(([fecha, v]) => ({ fecha, pedidos: v.pedidos, ventas: r2(v.ventas) })),
    porEstado: agrupar(filas, (f) => f.estado, (f) => Number(f.total)),
    porPago: agrupar(validas, (f) => f.metodoPago ?? 'Sin definir', (f) => Number(f.total)),
    porEntrega: agrupar(validas, (f) => (f.envioProveedor ? `Envío ${f.envioProveedor}` : 'Recojo / a coordinar'), (f) => Number(f.total)),
    porDepartamento: agrupar(validas.filter((f) => f.envioDepartamento), (f) => f.envioDepartamento!, (f) => Number(f.total)),
    topProductos: [...productos.values()].map((p) => ({ ...p, total: r2(p.total) })).sort((a, b) => b.unidades - a.unidades).slice(0, 10),
    topClientes: [...porEmail.values()].map((c) => ({ ...c, total: r2(c.total) })).sort((a, b) => b.total - a.total).slice(0, 10),
    ...(conDetalle
      ? {
          detalle: filas.map((f) => ({
            numero: f.numeroPedido, fecha: diaLima(f.createdAt), cliente: f.nombre, email: f.email, estado: f.estado, estadoPago: f.estadoPago,
            metodoPago: f.metodoPago, envio: r2(Number(f.envio)), igv: r2(Number(f.igv)), total: r2(Number(f.total)),
          })),
        }
      : {}),
  };
}

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  private pedidos(marcaId: string, desde: Date, hasta: Date) {
    return this.prisma.pedido.findMany({
      where: { marcaId, createdAt: { gte: desde, lte: hasta } },
      select: {
        numeroPedido: true, nombre: true, email: true, estado: true, estadoPago: true, metodoPago: true, total: true, igv: true, envio: true,
        envioProveedor: true, envioDepartamento: true, createdAt: true,
        items: { select: { cantidad: true, subtotal: true, nombreSnapshot: true, skuSnapshot: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 20000,
    });
  }

  async ventas(marcaId: string, desde?: string, hasta?: string, detalle = false) {
    const rango = resolverRango(desde, hasta);
    // Periodo anterior de igual duración, para comparar.
    const largo = rango.hasta.getTime() - rango.desde.getTime() + 1;
    const [filas, previas] = await Promise.all([
      this.pedidos(marcaId, rango.desde, rango.hasta),
      this.pedidos(marcaId, new Date(rango.desde.getTime() - largo), new Date(rango.desde.getTime() - 1)),
    ]);
    return calcularReporte(filas as Fila[], previas as Fila[], rango, detalle);
  }
}
