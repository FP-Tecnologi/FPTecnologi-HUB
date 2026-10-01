import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { SitiosService } from './sitios.service.js';

function setup(found: unknown = { id: 's1', marcaId: 'm1' }) {
  const sitio = {
    create: vi.fn().mockResolvedValue({}),
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(found),
    delete: vi.fn().mockResolvedValue({}),
  };
  return { sitio, service: new SitiosService({ sitio } as never) };
}

describe('SitiosService', () => {
  it('create toma el marcaId del servidor, no del body', async () => {
    const { sitio, service } = setup();
    await service.create('m1', { dominio: 'a.com', marcaId: 'otra' } as never);
    expect(sitio.create).toHaveBeenCalledWith({ data: { dominio: 'a.com', marcaId: 'm1' } });
  });

  it('findAll filtra siempre por marca', async () => {
    const { sitio, service } = setup();
    await service.findAll('m1');
    expect(sitio.findMany.mock.calls[0][0].where).toEqual({ marcaId: 'm1' });
  });

  it('remove busca y borra con marcaId', async () => {
    const { sitio, service } = setup();
    await service.remove('m1', 's1');
    expect(sitio.findFirst).toHaveBeenCalledWith({ where: { id: 's1', marcaId: 'm1' } });
    expect(sitio.delete).toHaveBeenCalledWith({ where: { id: 's1', marcaId: 'm1' } });
  });

  it('remove de un sitio de otra marca da 404 y no borra', async () => {
    const { sitio, service } = setup(null);
    await expect(service.remove('m1', 's2')).rejects.toBeInstanceOf(NotFoundException);
    expect(sitio.delete).not.toHaveBeenCalled();
  });
});
