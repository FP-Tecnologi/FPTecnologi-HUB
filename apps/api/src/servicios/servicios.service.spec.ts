import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ServiciosService } from './servicios.service.js';

function setup(existentes: { id: string; slug: string }[] = []) {
  const servicio = {
    findFirst: vi.fn(async ({ where }: { where: { slug?: string; OR?: unknown[]; marcaId: string } }) => {
      if (where.slug) return existentes.find((e) => e.slug === where.slug) ?? null;
      return existentes[0] ?? null;
    }),
    create: vi.fn(async ({ data }: { data: unknown }) => data),
    update: vi.fn(async ({ data }: { data: unknown }) => data),
    delete: vi.fn(async () => ({})),
    findMany: vi.fn(async () => []),
  };
  return { servicio, service: new ServiciosService({ servicio } as never) };
}

describe('ServiciosService', () => {
  it('create genera el slug desde el nombre y toma la marca del servidor', async () => {
    const { servicio, service } = setup();
    await service.create('m1', { nombre: 'Redes y Cableado Estructurado' } as never);
    const data = servicio.create.mock.calls[0]![0].data as Record<string, unknown>;
    expect(data).toMatchObject({ slug: 'redes-y-cableado-estructurado', marcaId: 'm1' });
  });

  it('create agrega -2 si el slug ya existe en la marca', async () => {
    const { servicio, service } = setup([{ id: 'x', slug: 'ciberseguridad' }]);
    await service.create('m1', { nombre: 'Ciberseguridad' } as never);
    expect((servicio.create.mock.calls[0]![0].data as { slug: string }).slug).toBe('ciberseguridad-2');
  });

  it('create convierte los beneficios y faqs a objetos planos (columnas Json)', async () => {
    const { servicio, service } = setup();
    await service.create('m1', { nombre: 'X', beneficios: [Object.assign(Object.create({ extra: 1 }), { titulo: 'T', texto: 'x' })], faqs: [{ p: 'P', r: 'R' }] } as never);
    const data = servicio.create.mock.calls[0]![0].data as { beneficios: unknown; faqs: unknown };
    expect(data.beneficios).toEqual([{ titulo: 'T', texto: 'x' }]);
    expect(data.faqs).toEqual([{ p: 'P', r: 'R' }]);
  });

  it('findOne busca por id o slug dentro de la marca', async () => {
    const { servicio, service } = setup([{ id: 'a', slug: 's' }]);
    await service.findOne('m1', 's', true);
    expect(servicio.findFirst).toHaveBeenCalledWith({ where: { marcaId: 'm1', OR: [{ id: 's' }, { slug: 's' }], activo: true } });
  });

  it('remove de un servicio inexistente da 404 y no borra', async () => {
    const servicio = { findFirst: vi.fn(async () => null), delete: vi.fn() };
    const service = new ServiciosService({ servicio } as never);
    await expect(service.remove('m1', 'nope')).rejects.toBeInstanceOf(NotFoundException);
    expect(servicio.delete).not.toHaveBeenCalled();
  });
});
