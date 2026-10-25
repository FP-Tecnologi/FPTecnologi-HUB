import { describe, expect, it, vi } from 'vitest';
import { VisitasService } from './visitas.service.js';

const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120';

function setup() {
  const prisma = {
    visitaWeb: {
      create: vi.fn(async () => ({})),
      groupBy: vi.fn(async ({ by }: { by: string[] }) =>
        by[0] === 'ruta'
          ? [{ ruta: '/', _count: { _all: 5 } }, { ruta: '/producto/laptop-x', _count: { _all: 3 } }]
          : by[0] === 'origen' ? [{ origen: 'google', _count: { _all: 4 } }] : [{ dispositivo: 'movil', _count: { _all: 4 } }]),
      count: vi.fn(async () => 2),
    },
    producto: { findMany: vi.fn(async () => [{ slug: 'laptop-x', nombre: 'Laptop X' }]) },
    $queryRaw: vi.fn(async () => []),
  };
  return { prisma, service: new VisitasService(prisma as never) };
}

describe('VisitasService', () => {
  it('registra con marcaId, origen y dispositivo; ignora bots y rutas internas', async () => {
    const { prisma, service } = setup();
    await service.registrar('m1', { ruta: '/tienda?x=1', referrer: 'https://www.google.com/', host: 'fptecnologi.com', ip: '1.1.1.1', ua: PC });
    await service.registrar('m1', { ruta: '/', ip: '1.1.1.1', ua: 'Googlebot/2.1' });
    await service.registrar('m1', { ruta: '/api/chat', ip: '1.1.1.1', ua: PC });
    expect(prisma.visitaWeb.create).toHaveBeenCalledTimes(1);
    const data = (prisma.visitaWeb.create.mock.calls[0] as unknown as [{ data: Record<string, string> }])[0].data;
    expect(data).toMatchObject({ marcaId: 'm1', ruta: '/tienda', origen: 'google', dispositivo: 'escritorio' });
  });

  it('un error de la base no llega a la web', async () => {
    const { prisma, service } = setup();
    prisma.visitaWeb.create.mockRejectedValueOnce(new Error('FK'));
    await expect(service.registrar('x', { ruta: '/', ip: '', ua: PC })).resolves.toBeUndefined();
  });

  it('resumen: todas las consultas con marcaId, días completos y productos con nombre', async () => {
    const { prisma, service } = setup();
    const r = await service.resumen('m1', 7);
    expect(r.porDia).toHaveLength(7);
    expect(r.paginas[0]).toEqual({ ruta: '/', vistas: 5 });
    expect(r.productos).toEqual([{ ruta: '/producto/laptop-x', nombre: 'Laptop X', vistas: 3 }]);
    for (const c of [...prisma.visitaWeb.groupBy.mock.calls, ...prisma.visitaWeb.count.mock.calls] as unknown as [{ where: { marcaId: string } }][]) {
      expect(c[0].where.marcaId).toBe('m1');
    }
  });
});
