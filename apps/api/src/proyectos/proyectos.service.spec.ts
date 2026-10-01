import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ProyectosService } from './proyectos.service.js';
import { ClientesService } from '../clientes/clientes.service.js';

describe.each([
  ['ProyectosService', ProyectosService, 'proyecto'],
  ['ClientesService', ClientesService, 'cliente'],
] as const)('%s', (_n, Servicio, modelo) => {
  function setup(found: unknown = { id: 'p1' }) {
    const m = {
      findMany: vi.fn(async () => []),
      findFirst: vi.fn(async () => found),
      create: vi.fn(async ({ data }: { data: unknown }) => data),
      update: vi.fn(async () => ({})),
      delete: vi.fn(async () => ({})),
    };
    return { m, service: new Servicio({ [modelo]: m } as never) };
  }

  it('list filtra siempre por marca y, para la web pública, solo activos', async () => {
    const { m, service } = setup();
    await service.list('m1', true);
    expect((m.findMany.mock.calls[0] as unknown as [{ where: unknown }])[0].where).toEqual({ marcaId: 'm1', activo: true });
    await service.list('m1');
    expect((m.findMany.mock.calls[1] as unknown as [{ where: unknown }])[0].where).toEqual({ marcaId: 'm1' });
  });

  it('create toma la marca del servidor, no del body', async () => {
    const { m, service } = setup();
    await service.create('m1', { marcaId: 'otra' } as never);
    expect((m.create.mock.calls[0] as unknown as [{ data: { marcaId: string } }])[0].data.marcaId).toBe('m1');
  });

  it('update y remove buscan dentro de la marca y dan 404 si no es de ella', async () => {
    const { m, service } = setup(null);
    await expect(service.update('m1', 'p9', {})).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.remove('m1', 'p9')).rejects.toBeInstanceOf(NotFoundException);
    expect(m.update).not.toHaveBeenCalled();
    expect(m.delete).not.toHaveBeenCalled();
  });

  it('remove borra con id y marcaId', async () => {
    const { m, service } = setup();
    await service.remove('m1', 'p1');
    expect(m.delete).toHaveBeenCalledWith({ where: { id: 'p1', marcaId: 'm1' } });
  });
});
