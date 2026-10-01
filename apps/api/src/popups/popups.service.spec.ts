import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { PopupsService } from './popups.service.js';
import { PLANTILLAS } from './popups.modelo.js';

const contenido = (plantilla: string) => ({ ...PLANTILLAS.find((p) => p.id === plantilla)!.contenido });
const fila = (o: Record<string, unknown> = {}) => ({
  id: 'p1', marcaId: 'm1', nombre: 'Test', plantilla: 'promocion', formato: 'modal', estado: 'BORRADOR', contenido: contenido('promocion'),
  productoId: null, prioridad: 0, disparador: 'retraso', disparadorValor: 5, frecuencia: 'sesion', frecuenciaValor: 1,
  paginas: ['home'], dispositivo: 'todos', inicio: null, fin: null, vistas: 0, clics: 0, createdAt: new Date(), updatedAt: new Date(), ...o,
});

function servicio(popups: ReturnType<typeof fila>[], productos: Record<string, unknown>[] = []) {
  const prisma = {
    popup: { findFirst: vi.fn(async () => popups[0] ?? null), findMany: vi.fn(async () => popups), updateMany: vi.fn(async (_args: unknown) => ({ count: 1 })) },
    producto: { findFirst: vi.fn(async () => productos[0] ?? null), findMany: vi.fn(async () => productos) },
  };
  return { svc: new PopupsService(prisma as never), prisma };
}

describe('PopupsService', () => {
  it('no deja activar un popup sin páginas', async () => {
    const { svc } = servicio([fila({ paginas: [] })]);
    await expect(svc.actualizar('m1', 'p1', { estado: 'ACTIVO' })).rejects.toThrow(/página/);
  });

  it('no deja activar uno de producto sin producto', async () => {
    const { svc } = servicio([fila({ plantilla: 'producto', contenido: contenido('producto') })]);
    await expect(svc.actualizar('m1', 'p1', { estado: 'ACTIVO' })).rejects.toThrow(/producto/);
  });

  it('rechaza fin anterior al inicio', async () => {
    const { svc } = servicio([fila()]);
    await expect(svc.actualizar('m1', 'p1', { inicio: '2026-12-01T00:00:00Z', fin: '2026-11-01T00:00:00Z' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('guarda el contenido limpio y siempre filtra por marca', async () => {
    const { svc, prisma } = servicio([fila()]);
    await svc.actualizar('m1', 'p1', { contenido: { titulo: 'Hola', url: 'javascript:1', extra: 'x' }, paginas: ['tienda', 'inventada'] });
    const arg = prisma.popup.updateMany.mock.calls[0]![0] as unknown as { where: Record<string, unknown>; data: Record<string, any> };
    expect(arg.where).toEqual({ id: 'p1', marcaId: 'm1' });
    expect(arg.data.contenido.url).toBe('');
    expect(arg.data.contenido).not.toHaveProperty('extra');
    expect(arg.data.paginas).toEqual(['tienda']);
  });

  it('publicos descarta los fuera de fechas y resuelve el enlace del producto', async () => {
    const enCurso = fila({ id: 'a', estado: 'ACTIVO', plantilla: 'producto', contenido: contenido('producto'), productoId: 'x1' });
    const vencido = fila({ id: 'b', estado: 'ACTIVO', fin: new Date('2020-01-01') });
    const { svc } = servicio([enCurso, vencido], [{ id: 'x1', nombre: 'Laptop', slug: 'laptop-pro', precio: '1200', precioAntes: null, moneda: 'USD', imagenes: ['https://img/x.jpg'] }]);
    const r = await svc.publicos('m1', 'home');
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ id: 'a', enlace: '/producto/laptop-pro', producto: { nombre: 'Laptop', precio: 1200 } });
  });

  it('publicos omite un popup de producto cuyo producto ya no está activo', async () => {
    const { svc } = servicio([fila({ estado: 'ACTIVO', plantilla: 'producto', contenido: contenido('producto'), productoId: 'x1' })], []);
    expect(await svc.publicos('m1', 'home')).toEqual([]);
  });
});
