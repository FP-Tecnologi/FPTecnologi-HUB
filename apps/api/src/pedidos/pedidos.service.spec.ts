import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { PedidosService } from './pedidos.service.js';
import type { CrearPedidoPublicoDto } from './dto/crear-pedido-publico.dto.js';

const base: CrearPedidoPublicoDto = {
  nombre: 'Ana Pérez',
  email: 'Ana@Correo.com',
  celular: '+51 987654321',
  items: [{ productoId: 'p1', cantidad: 2 }],
};

function setup(stock = 10) {
  const producto = { id: 'p1', nombre: 'Monitor X', sku: 'SKU1', precio: 100, stock };
  const updateMany = vi.fn(async () => ({ count: 1 }));
  const pedidoCreate = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 'ped1', ...data }));
  const prisma = {
    marca: { findUnique: vi.fn(async () => ({ id: 'm1' })) },
    producto: { findMany: vi.fn(async () => [producto]), updateMany },
    pedido: { create: pedidoCreate },
    usuarioMarcaRol: { findMany: vi.fn(async () => []) },
    notificacion: { createMany: vi.fn() },
  };
  const mail = { sendPedidoConfirmado: vi.fn(async () => {}) };
  const service = new PedidosService(prisma as never, mail as never);
  return { service, prisma, pedidoCreate, updateMany };
}

describe('PedidosService.crearPublico', () => {
  it('calcula totales server-side con IGV y guarda snapshot', async () => {
    const { service, pedidoCreate, updateMany } = setup();
    const r = await service.crearPublico('m1', base, '1.1.1.1');
    expect(r.ok).toBe(true);
    expect(r.numeroPedido).toMatch(/^FP-\d{4}-[A-Z0-9]{6}$/);
    // 2 × (100 + 18% IGV) = 236
    expect(r.total).toBe(236);
    // Descuento atómico y condicional (no sobrevende)
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', marcaId: 'm1', stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });
    const calls = pedidoCreate.mock.calls as unknown as Array<[{ data: Record<string, unknown> }]>;
    const data = calls[0][0].data;
    expect(data).toMatchObject({
      marcaId: 'm1',
      email: 'ana@correo.com',
      celular: '987654321',
      estadoPago: 'POR_CONFIRMAR',
      subtotal: 200,
      igv: 36,
      total: 236,
    });
    const items = (data['items'] as { create: Array<Record<string, unknown>> }).create;
    expect(items[0]).toMatchObject({
      nombreSnapshot: 'Monitor X',
      skuSnapshot: 'SKU1',
      precioUnitario: 100,
      igvUnitario: 18,
      subtotal: 236,
    });
  });

  it('honeypot: responde ok sin guardar', async () => {
    const { service, pedidoCreate } = setup();
    const r = await service.crearPublico('m1', { ...base, website: 'bot' }, '2.2.2.2');
    expect(r).toEqual({ ok: true, numeroPedido: null, total: 0 });
    expect(pedidoCreate).not.toHaveBeenCalled();
  });

  it('rechaza celular inválido y stock insuficiente', async () => {
    const { service } = setup();
    await expect(service.crearPublico('m1', { ...base, celular: '123' }, '3.3.3.3')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    const escaso = setup(1);
    await expect(escaso.service.crearPublico('m1', base, '3.3.3.4')).rejects.toThrow('Stock insuficiente');
  });

  it('rechaza productos de otra marca', async () => {
    const { service, prisma } = setup();
    (prisma.producto.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);
    await expect(service.crearPublico('m1', base, '4.4.4.4')).rejects.toThrow('no están disponibles');
  });

  it('devuelve el stock si el pedido no se crea', async () => {
    const { service, prisma, updateMany } = setup();
    (prisma.pedido.create as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('caída'));
    await expect(service.crearPublico('m1', base, '5.5.5.5')).rejects.toThrow('caída');
    expect(updateMany).toHaveBeenLastCalledWith({
      where: { id: 'p1', marcaId: 'm1' },
      data: { stock: { increment: 2 } },
    });
  });
});

describe('PedidosService.updateEstado', () => {
  function setupEstado(estado = 'PENDIENTE') {
    const updateMany = vi.fn(async () => ({ count: 1 }));
    const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 'ped1', ...data }));
    const prisma = {
      pedido: {
        findFirst: vi.fn(async () => ({ id: 'ped1', estado, items: [{ productoId: 'p1', cantidad: 2 }, { productoId: 'p2', cantidad: 1 }] })),
        update,
      },
      producto: { updateMany },
    };
    return { service: new PedidosService(prisma as never, {} as never), update, updateMany };
  }

  it('actualiza solo el estado de pago', async () => {
    const { service, update, updateMany } = setupEstado();
    await service.updateEstado('m1', 'ped1', { estadoPago: 'PAGADO' });
    expect(update).toHaveBeenCalledWith({ where: { id: 'ped1', marcaId: 'm1' }, data: { estadoPago: 'PAGADO' } });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('cancelar devuelve el stock de cada ítem', async () => {
    const { service, updateMany } = setupEstado();
    await service.updateEstado('m1', 'ped1', { estado: 'CANCELADO' });
    expect(updateMany).toHaveBeenCalledWith({ where: { id: 'p1', marcaId: 'm1' }, data: { stock: { increment: 2 } } });
    expect(updateMany).toHaveBeenCalledWith({ where: { id: 'p2', marcaId: 'm1' }, data: { stock: { increment: 1 } } });
  });

  it('un pedido cancelado no se reactiva ni devuelve stock dos veces', async () => {
    const { service, updateMany } = setupEstado('CANCELADO');
    await expect(service.updateEstado('m1', 'ped1', { estado: 'PENDIENTE' })).rejects.toBeInstanceOf(BadRequestException);
    await service.updateEstado('m1', 'ped1', { estado: 'CANCELADO' });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('exige estado o estado de pago', async () => {
    const { service } = setupEstado();
    await expect(service.updateEstado('m1', 'ped1', {})).rejects.toBeInstanceOf(BadRequestException);
  });
});
