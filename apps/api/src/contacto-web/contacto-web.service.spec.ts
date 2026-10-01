import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { ContactoWebService } from './contacto-web.service.js';
import type { CrearContactoDto } from './contacto-web.dto.js';

const base: CrearContactoDto = {
  nombre: 'Ana Pérez',
  email: 'Ana@Correo.com',
  celular: '+51 987 654 321',
  mensaje: 'Quiero información de servidores',
};

function setup() {
  const create = vi.fn(async ({ data }) => ({ id: 'c1', ...data }));
  const prisma = {
    marca: { findUnique: vi.fn(async () => ({ id: 'm1' })) },
    contactoWeb: { create },
    usuarioMarcaRol: { findMany: vi.fn(async () => []) },
    notificacion: { createMany: vi.fn() },
  };
  const service = new ContactoWebService(prisma as never, { sendContactoNuevo: vi.fn() } as never);
  return { service, create };
}

describe('ContactoWebService.crearPublico', () => {
  it('guarda el contacto normalizado', async () => {
    const { service, create } = setup();
    await service.crearPublico('m1', base, '1.1.1.1');
    expect(create.mock.calls[0][0].data).toMatchObject({
      marcaId: 'm1', tipo: 'CONTACTO', email: 'ana@correo.com', celular: '987654321',
    });
  });

  it('acepta un reclamo sin celular', async () => {
    const { service, create } = setup();
    await service.crearPublico('m1', { ...base, tipo: 'RECLAMO', celular: undefined }, '1.1.1.2');
    expect(create.mock.calls[0][0].data).toMatchObject({ tipo: 'RECLAMO', celular: null });
  });

  it('honeypot: responde ok sin guardar', async () => {
    const { service, create } = setup();
    expect(await service.crearPublico('m1', { ...base, website: 'x' }, '2.2.2.2')).toEqual({ ok: true });
    expect(create).not.toHaveBeenCalled();
  });

  it('rechaza un celular inválido', async () => {
    const { service } = setup();
    await expect(service.crearPublico('m1', { ...base, celular: '123' }, '3.3.3.3')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('frena el spam: el 6.º envío seguido de la misma IP falla', async () => {
    const { service } = setup();
    for (let i = 0; i < 5; i++) await service.crearPublico('m1', base, '4.4.4.4');
    await expect(service.crearPublico('m1', base, '4.4.4.4')).rejects.toMatchObject({ status: 429 });
  });
});
