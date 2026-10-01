import { describe, expect, it, vi } from 'vitest';
import { ProductosService, slugify } from './productos.service.js';

describe('slugify', () => {
  it('minúsculas, sin tildes, espacios a guiones', () => {
    expect(slugify('Monitor HP E27 G5 27" FHD')).toBe('monitor-hp-e27-g5-27-fhd');
    expect(slugify('Pantalla Interactiva')).toBe('pantalla-interactiva');
  });
  it('limpia caracteres raros de SKUs', () => {
    expect(slugify('  98TR3DK-B ')).toBe('98tr3dk-b');
    expect(slugify('IFP7533-G -WR')).toBe('ifp7533-g-wr');
  });
});

function setupBusqueda() {
  const findMany = vi.fn(async () => []);
  const count = vi.fn(async () => 0);
  const prisma = {
    producto: {
      findUnique: vi.fn(async () => null),
      findFirst: vi.fn(async () => null),
      findMany,
      count,
      create: vi.fn(),
    },
    categoria: { findMany: vi.fn(async () => []), findFirst: vi.fn(async () => null) },
  };
  const service = new ProductosService(prisma as never);
  const ultimoWhere = () => {
    const calls = findMany.mock.calls as unknown as Array<[{ where: Record<string, unknown> }]>;
    return calls[calls.length - 1][0].where;
  };
  return { service, findMany, count, ultimoWhere };
}

describe('ProductosService.buscarPublico', () => {
  it('siempre filtra por marcaId + activo y pagina por defecto', async () => {
    const { service, count, ultimoWhere } = setupBusqueda();
    const r = await service.buscarPublico('m1', {});
    expect(r).toMatchObject({ data: [], total: 0, page: 1, limit: 24, totalPages: 1 });
    expect(ultimoWhere()).toMatchObject({ marcaId: 'm1', activo: true });
    expect(count).toHaveBeenCalledWith({ where: expect.objectContaining({ marcaId: 'm1' }) });
  });

  it('q busca en nombre/descripción/sku/marca (insensible)', async () => {
    const { service, ultimoWhere } = setupBusqueda();
    await service.buscarPublico('m1', { q: 'dell' });
    const or = ultimoWhere()['OR'] as unknown[];
    expect(or).toHaveLength(4);
    expect(or[0]).toEqual({ nombre: { contains: 'dell', mode: 'insensitive' } });
  });

  it('ofertas, destacados, rango de precio y categoría por slug', async () => {
    const { service, ultimoWhere } = setupBusqueda();
    await service.buscarPublico('m1', {
      soloOfertas: true,
      destacados: true,
      minPrecio: 100,
      maxPrecio: 500,
      categoriaSlug: 'monitores',
    });
    expect(ultimoWhere()).toMatchObject({
      marcaId: 'm1',
      precioAntes: { not: null },
      destacado: true,
      precio: { gte: 100, lte: 500 },
      categoria: { marcaId: 'm1', slug: 'monitores' },
    });
  });

  it('limita el page-size a 100 y pagina bien', async () => {
    const { service, findMany } = setupBusqueda();
    await service.buscarPublico('m1', { page: 3, limit: 999 });
    const calls = findMany.mock.calls as unknown as Array<[{ skip: number; take: number }]>;
    expect(calls[calls.length - 1][0]).toMatchObject({ skip: 200, take: 100 });
  });
});
