import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { BoletinService } from './boletin.service.js';

function setup(existe = false) {
  const create = vi.fn();
  const prisma = {
    marca: { findUnique: vi.fn(async () => ({ id: 'm1' })) },
    suscriptorBoletin: { findFirst: vi.fn(async () => (existe ? { id: 's1' } : null)), create },
  };
  return { service: new BoletinService(prisma as never), create, prisma };
}

describe('BoletinService.suscribir', () => {
  it('guarda el correo normalizado', async () => {
    const { service, create } = setup();
    await service.suscribir('m1', { email: ' Ana@Correo.COM ' }, '1.1.1.1');
    expect(create.mock.calls[0][0].data).toMatchObject({ marcaId: 'm1', email: 'ana@correo.com' });
  });

  it('es idempotente: un correo ya suscrito responde ok sin duplicar', async () => {
    const { service, create } = setup(true);
    expect(await service.suscribir('m1', { email: 'a@b.com' }, '2.2.2.2')).toEqual({ ok: true });
    expect(create).not.toHaveBeenCalled();
  });

  it('honeypot: responde ok sin tocar la base', async () => {
    const { service, prisma } = setup();
    expect(await service.suscribir('m1', { email: 'a@b.com', website: 'x' }, '3.3.3.3')).toEqual({ ok: true });
    expect(prisma.marca.findUnique).not.toHaveBeenCalled();
  });

  it('rechaza marca inexistente y limita por IP', async () => {
    const { service, prisma } = setup();
    prisma.marca.findUnique.mockResolvedValueOnce(null as never);
    await expect(service.suscribir('x', { email: 'a@b.com' }, '4.4.4.4')).rejects.toBeInstanceOf(BadRequestException);
    for (let i = 0; i < 5; i++) await service.suscribir('m1', { email: `a${i}@b.com` }, '5.5.5.5');
    await expect(service.suscribir('m1', { email: 'z@b.com' }, '5.5.5.5')).rejects.toMatchObject({ status: 429 });
  });
});
