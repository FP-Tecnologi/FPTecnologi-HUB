import { describe, expect, it, vi } from 'vitest';
import { PresupuestosService } from './presupuestos.service.js';

const productos = [
  { id: 'p1', sku: 'A1', nombre: 'Monitor', precio: 200, precioMayorista: 180 },
  { id: 'p2', sku: 'B2', nombre: 'Laptop', precio: 1000, precioMayorista: null },
];

function setup() {
  const prisma = {
    producto: { findMany: vi.fn(async (a: { where: { sku: { in: string[] } } }) => productos.filter((p) => a.where.sku.in.includes(p.sku))) },
    presupuesto: {
      create: vi.fn(async (a: { data: Record<string, unknown> }) => ({ id: 'x1', ...a.data })),
      findFirst: vi.fn(async () => ({ id: 'x1', numero: 'COT-2026-ABC123', moneda: 'USD', clienteNombre: 'Ana', clienteDocumento: null, clienteEmail: 'a@acme.com', clienteTelefono: null, clienteDireccion: null, notas: null, subtotal: 1, igv: 0.18, total: 1.18, createdAt: new Date(), validezHasta: new Date(), items: [] })),
    },
    marca: { findFirst: vi.fn(async () => ({ nombre: 'FPTecnologi' })) },
    contenidoWeb: { findFirst: vi.fn(async () => null) },
  };
  const mail = { sendPresupuestoCliente: vi.fn(async () => {}), sendLeadNuevo: vi.fn(async () => {}) };
  return { service: new PresupuestosService(prisma as never, mail as never), prisma, mail };
}

const cliente = { clienteNombre: 'Acme SAC', clienteEmail: 'a@acme.com', clienteTelefono: '987654321' };

describe('PresupuestosService.crear', () => {
  it('aplica el precio mayorista (o el normal si falta) y calcula IGV y total en el servidor', async () => {
    const { service, prisma, mail } = setup();
    await service.crear('m1', { ...cliente, items: [{ sku: 'A1', cantidad: 6 }, { sku: 'B2', cantidad: 6 }] }, 'ip-1');
    // El correo sale en segundo plano (primero genera el PDF adjunto).
    await vi.waitFor(() => expect(mail.sendPresupuestoCliente).toHaveBeenCalledWith('a@acme.com', expect.objectContaining({ total: 'US$ 8,354.40' }), [expect.objectContaining({ filename: 'presupuesto-COT-2026-ABC123.pdf' })]));
    const data = prisma.presupuesto.create.mock.calls[0][0].data as { subtotal: number; igv: number; total: number; items: { create: { precioUnitario: number; mayorista: boolean }[] } };
    expect(data.items.create.map((i) => [i.precioUnitario, i.mayorista])).toEqual([[180, true], [1000, false]]);
    expect(data.subtotal).toBe(7080); // 6*180 + 6*1000
    expect(data.igv).toBe(1274.4);
    expect(data.total).toBe(8354.4);
  });

  it('si un producto ya no está disponible no registra nada', async () => {
    const { service, prisma } = setup();
    await expect(service.crear('m1', { ...cliente, items: [{ sku: 'A1', cantidad: 6 }, { sku: 'ZZ', cantidad: 6 }] }, 'ip-2')).rejects.toThrow('disponibles');
    expect(prisma.presupuesto.create).not.toHaveBeenCalled();
  });
});
