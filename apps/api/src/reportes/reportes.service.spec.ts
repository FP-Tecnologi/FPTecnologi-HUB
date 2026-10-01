import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { calcularReporte, diaLima, resolverRango } from './reportes.service.js';

const item = (nombre: string, sku: string, cantidad: number, subtotal: number) => ({ cantidad, subtotal, nombreSnapshot: nombre, skuSnapshot: sku });
const pedido = (fecha: string, total: number, extra: Record<string, unknown> = {}) => ({
  numeroPedido: 'FP-1', nombre: 'Ana', email: 'ana@x.com', estado: 'ENTREGADO', estadoPago: 'PAGADO', metodoPago: 'YAPE_PLIN',
  total, igv: total * 0.15, envio: 0, envioProveedor: null, envioDepartamento: null, createdAt: new Date(fecha), items: [item('Monitor', 'M1', 1, total)], ...extra,
});

describe('resolverRango', () => {
  it('rango explícito inclusivo en hora de Lima', () => {
    const r = resolverRango('2026-10-01', '2026-10-03');
    expect(r.dias).toBe(2);
    expect(diaLima(r.desde)).toBe('2026-10-01');
    expect(diaLima(r.hasta)).toBe('2026-10-03');
  });
  it('por defecto: últimos 30 días terminando hoy (Lima)', () => {
    const r = resolverRango(undefined, undefined, new Date('2026-10-15T03:00:00Z')); // 14-oct 22:00 en Lima
    expect(diaLima(r.hasta)).toBe('2026-10-14');
    expect(r.dias).toBe(29);
  });
  it('rechaza rangos invertidos, inválidos o mayores a un año', () => {
    expect(() => resolverRango('2026-10-05', '2026-10-01')).toThrow(BadRequestException);
    expect(() => resolverRango('hola', '2026-10-01')).toThrow(BadRequestException);
    expect(() => resolverRango('2024-01-01', '2026-10-01')).toThrow('máximo');
  });
});

describe('calcularReporte', () => {
  const rango = resolverRango('2026-10-01', '2026-10-03');
  it('suma solo pedidos no cancelados, rellena días vacíos y compara con el periodo previo', () => {
    const filas = [
      pedido('2026-10-01T15:00:00Z', 100),
      pedido('2026-10-01T16:00:00Z', 50, { email: 'bea@x.com', nombre: 'Bea', estadoPago: 'POR_CONFIRMAR', envioProveedor: 'SHALOM', envioDepartamento: 'Cusco', envio: 10 }),
      pedido('2026-10-03T15:00:00Z', 999, { estado: 'CANCELADO' }),
    ];
    const r = calcularReporte(filas as never, [pedido('2026-09-29T15:00:00Z', 80)] as never, rango, true);
    expect(r.kpis.ventas).toBe(150);
    expect(r.kpis.pedidos).toBe(3);
    expect(r.kpis.cancelados).toBe(1);
    expect(r.kpis.ticketPromedio).toBe(75);
    expect(r.kpis.porCobrar).toBe(50);
    expect(r.kpis.ventasPrevias).toBe(80);
    expect(r.porDia.map((d) => d.ventas)).toEqual([150, 0, 0]);
    expect(r.porEntrega.map((e) => e.nombre).sort()).toEqual(['Envío SHALOM', 'Recojo / a coordinar']);
    expect(r.porDepartamento).toEqual([{ nombre: 'Cusco', pedidos: 1, total: 50 }]);
    expect(r.topProductos[0]).toMatchObject({ sku: 'M1', unidades: 2, total: 150 });
    expect(r.topClientes.map((c) => c.email)).toEqual(['ana@x.com', 'bea@x.com']);
    expect(r.detalle).toHaveLength(3);
  });

  it('un pedido de la noche limeña cuenta en su día local, no en el día UTC', () => {
    // 2 oct 02:30 UTC = 1 oct 21:30 en Lima
    const r = calcularReporte([pedido('2026-10-02T02:30:00Z', 40)] as never, [], rango, false);
    expect(r.porDia[0]).toMatchObject({ fecha: '2026-10-01', ventas: 40 });
  });
});
