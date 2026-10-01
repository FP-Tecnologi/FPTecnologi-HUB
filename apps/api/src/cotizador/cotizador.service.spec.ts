import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { CotizadorService, normalizarCelular } from './cotizador.service.js';
import type { CrearLeadDto } from './cotizador.dto.js';

const base: CrearLeadDto = {
  nombres: 'Ana',
  apellidos: 'Pérez',
  tipoPersona: 'NATURAL',
  tipoDocumento: 'DNI',
  nroDocumento: '12345678',
  email: 'Ana@Correo.com',
  celular: '+51 987 654 321',
  interes: 'Servidores',
};

function setup() {
  const create = vi.fn(async ({ data }) => ({ id: 'l1', ...data }));
  const prisma = {
    marca: { findUnique: vi.fn(async () => ({ id: 'm1' })) },
    leadCotizador: { create },
    usuarioMarcaRol: { findMany: vi.fn(async () => []) },
    notificacion: { createMany: vi.fn() },
  };
  const service = new CotizadorService(prisma as never, { sendLeadNuevo: vi.fn() } as never);
  return { service, create, prisma };
}

describe('normalizarCelular', () => {
  it('acepta formatos comunes', () => {
    expect(normalizarCelular('987654321')).toBe('987654321');
    expect(normalizarCelular('+51 987-654-321')).toBe('987654321');
    expect(normalizarCelular('51987654321')).toBe('987654321');
  });
  it('rechaza lo que no es celular', () => {
    expect(normalizarCelular('12345678')).toBeNull();
    expect(normalizarCelular('887654321')).toBeNull();
  });
});

describe('CotizadorService.crearPublico', () => {
  it('guarda el lead normalizado', async () => {
    const { service, create } = setup();
    await service.crearPublico('m1', base, '1.1.1.1');
    expect(create.mock.calls[0][0].data).toMatchObject({ marcaId: 'm1', email: 'ana@correo.com', celular: '987654321' });
  });

  it('honeypot: responde ok sin guardar', async () => {
    const { service, create } = setup();
    expect(await service.crearPublico('m1', { ...base, website: 'x' }, '2.2.2.2')).toEqual({ ok: true });
    expect(create).not.toHaveBeenCalled();
  });

  it('rechaza DNI con longitud de RUC y jurídica sin RUC/empresa', async () => {
    const { service } = setup();
    await expect(service.crearPublico('m1', { ...base, nroDocumento: '12345678901' }, '3.3.3.3')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.crearPublico('m1', { ...base, tipoPersona: 'JURIDICA' }, '3.3.3.4')).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.crearPublico('m1', { ...base, tipoPersona: 'JURIDICA', tipoDocumento: 'RUC', nroDocumento: '20123456789' }, '3.3.3.5'),
    ).rejects.toThrow('empresa');
  });

  it('limita solicitudes repetidas por IP', async () => {
    const { service } = setup();
    for (let i = 0; i < 5; i++) await service.crearPublico('m1', base, '9.9.9.9');
    await expect(service.crearPublico('m1', base, '9.9.9.9')).rejects.toMatchObject({ status: 429 });
  });
});
