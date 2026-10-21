import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { LibroReclamacionesService, reiniciarLimitadores } from './libro-reclamaciones.service.js';
import { sumarDiasHabiles } from './dias-habiles.js';
import type { CrearHojaDto } from './libro-reclamaciones.dto.js';

const anio = Number(new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' }).slice(0, 4));

beforeEach(() => reiniciarLimitadores());
afterEach(() => vi.useRealTimers());

const base: CrearHojaDto = {
  nombres: 'Ana',
  apellidos: 'Pérez',
  tipoDocumento: 'DNI',
  nroDocumento: '12345678',
  domicilio: 'Av. Siempre Viva 123',
  telefono: '987654321',
  email: 'Ana@Correo.com',
  menorEdad: false,
  tipoBien: 'PRODUCTO',
  moneda: 'PEN',
  descripcionBien: 'Router',
  tipo: 'RECLAMO',
  detalle: 'El producto llegó dañado',
  pedidoConsumidor: 'Quiero un reembolso',
  medioRespuesta: 'CORREO',
  aceptaVeracidad: true,
};

function setup(opts: { max?: number; createErrors?: unknown[] } = {}) {
  const errores = [...(opts.createErrors ?? [])];
  const create = vi.fn(async ({ data }: { data: Record<string, any> }) => {
    const e = errores.shift();
    if (e) throw e;
    return { id: 'h1', fecha: new Date(), ...data };
  });
  const prisma = {
    marca: {
      findUnique: vi.fn(async () => ({ id: 'm1', nombre: 'Fimav', razonSocial: 'Fimav SAC', ruc: '20123456789', direccionFiscal: 'Lima', contactoEmail: 'a@b.pe' })),
    },
    hojaReclamacion: {
      aggregate: vi.fn(async (_a?: { where: unknown }) => ({ _max: { correlativo: opts.max ?? null } })),
      create,
      findFirst: vi.fn(),
      findMany: vi.fn(async (_a?: { where: Record<string, any> }) => []),
      updateMany: vi.fn(async (_a?: unknown) => ({ count: 1 })),
    },
    usuarioMarcaRol: { findMany: vi.fn(async () => [{ usuario: { id: 'u1', email: 'eq@x.pe', activo: true } }]) },
    notificacion: { createMany: vi.fn() },
  };
  const mail = { sendHojaConsumidor: vi.fn(), sendHojaEquipo: vi.fn(), sendRespuestaReclamo: vi.fn() };
  const service = new LibroReclamacionesService(prisma as never, mail as never);
  return { service, create, prisma, mail };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const flush = () => new Promise((r) => setTimeout(r, 0));

describe('LibroReclamacionesService.crearPublico', () => {
  it('(a) guarda con marcaId, email en minúsculas, código y fecha límite', async () => {
    const { service, create } = setup();
    const r = await service.crearPublico('m1', base, '10.0.0.1');
    const data = create.mock.calls[0][0].data;
    expect(data).toMatchObject({ marcaId: 'm1', email: 'ana@correo.com', anio, correlativo: 1, codigo: `LR-0001-${anio}` });
    expect(r.codigo).toBe(`LR-0001-${anio}`);
    expect(data.fechaLimite.getTime()).toBe(sumarDiasHabiles(data.fecha, 15).getTime());
  });

  it('(a) correlativo 2 si ya hay uno', async () => {
    const { service, prisma } = setup({ max: 1 });
    const r = await service.crearPublico('m1', base, '10.0.0.2');
    expect(r.codigo).toBe(`LR-0002-${anio}`);
    expect(prisma.hojaReclamacion.aggregate.mock.calls[0]![0]!.where).toEqual({ marcaId: 'm1', anio });
  });

  it('(b) honeypot: ok sin guardar', async () => {
    const { service, create } = setup();
    expect(await service.crearPublico('m1', { ...base, website: 'x' }, '10.0.0.3')).toEqual({ ok: true });
    expect(create).not.toHaveBeenCalled();
  });

  it('(c) marca inexistente → BadRequest', async () => {
    const { service, prisma } = setup();
    prisma.marca.findUnique.mockResolvedValueOnce(null as never);
    await expect(service.crearPublico('zz', base, '10.0.0.4')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('(d) valida longitud del documento por tipo', async () => {
    const { service } = setup();
    const ip = '10.0.0.5';
    await expect(service.crearPublico('m1', { ...base, nroDocumento: '1234567' }, ip)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.crearPublico('m1', { ...base, tipoDocumento: 'RUC', nroDocumento: '1234567890' }, ip)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.crearPublico('m1', { ...base, tipoDocumento: 'CE', nroDocumento: '12345' }, ip)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.crearPublico('m1', { ...base, tipoDocumento: 'RUC', nroDocumento: '20123456789' }, ip)).resolves.toMatchObject({ ok: true });
    await expect(service.crearPublico('m1', { ...base, tipoDocumento: 'CE', nroDocumento: 'ABC123456' }, ip)).resolves.toMatchObject({ ok: true });
  });

  it('(e) menor de edad exige representante; si no es menor se ignora', async () => {
    const { service, create } = setup();
    await expect(service.crearPublico('m1', { ...base, menorEdad: true }, '10.0.0.6')).rejects.toBeInstanceOf(BadRequestException);
    await service.crearPublico('m1', { ...base, repNombres: 'Luis', repTipoDocumento: 'DNI', repNroDocumento: '87654321' }, '10.0.0.7');
    expect(create.mock.calls[0][0].data).toMatchObject({ repNombres: null, repTipoDocumento: null, repNroDocumento: null });
    await service.crearPublico('m1', { ...base, menorEdad: true, repNombres: 'Luis', repTipoDocumento: 'DNI', repNroDocumento: '87654321' }, '10.0.0.8');
    expect(create.mock.calls[1][0].data).toMatchObject({ repNombres: 'Luis', repNroDocumento: '87654321' });
  });

  it('(f) reintenta el correlativo ante P2002', async () => {
    const { service, create } = setup({ createErrors: [{ code: 'P2002' }] });
    const r = await service.crearPublico('m1', base, '10.0.0.9');
    expect(create).toHaveBeenCalledTimes(2);
    expect(r.ok).toBe(true);
  });

  it('(g) la 6.ª en 10 min desde la misma IP → 429', async () => {
    const { service } = setup();
    for (let i = 0; i < 5; i++) await service.crearPublico('m1', base, '10.0.1.1');
    await expect(service.crearPublico('m1', base, '10.0.1.1')).rejects.toMatchObject({ status: 429 });
  });

  it('(h) envía copia y aviso; si el correo falla igual devuelve ok', async () => {
    const { service, mail } = setup();
    await service.crearPublico('m1', base, '10.0.2.1');
    await flush();
    expect(mail.sendHojaConsumidor).toHaveBeenCalledWith('ana@correo.com', expect.objectContaining({ codigo: `LR-0001-${anio}` }));
    expect(mail.sendHojaEquipo).toHaveBeenCalledWith('eq@x.pe', expect.anything(), expect.any(String));

    const silencio = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const f = setup();
    f.mail.sendHojaConsumidor.mockRejectedValue(new Error('smtp'));
    f.mail.sendHojaEquipo.mockRejectedValue(new Error('smtp'));
    await expect(f.service.crearPublico('m1', base, '10.0.2.2')).resolves.toMatchObject({ ok: true });
    await flush();
    expect(silencio).toHaveBeenCalled();
    silencio.mockRestore();
  });
});

describe('LibroReclamacionesService.crearPublico (casos adicionales)', () => {
  it('(2) el año sale de la fecha de la hoja en hora de Lima', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-01-01T01:00:00Z')); // 31/12/2026 20:00 Lima
    const { service } = setup();
    const r = await service.crearPublico('m1', base, '10.9.0.1');
    expect(r.codigo).toBe('LR-0001-2026');
  });

  it('(3) PASAPORTE 6-15 alfanumérico; CE sigue 9-12; también para el representante', async () => {
    const { service } = setup();
    const ip = '10.9.0.2';
    const nuevo = reiniciarLimitadores; // 6 intentos > tope por IP
    await expect(service.crearPublico('m1', { ...base, tipoDocumento: 'PASAPORTE', nroDocumento: 'AB123' }, ip)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.crearPublico('m1', { ...base, tipoDocumento: 'PASAPORTE', nroDocumento: 'AB1234567890123X' }, ip)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.crearPublico('m1', { ...base, tipoDocumento: 'PASAPORTE', nroDocumento: 'AB1234' }, ip)).resolves.toMatchObject({ ok: true });
    await expect(service.crearPublico('m1', { ...base, tipoDocumento: 'CE', nroDocumento: 'AB1234' }, ip)).rejects.toBeInstanceOf(BadRequestException);
    nuevo();
    const rep = { menorEdad: true, repNombres: 'Luis', repNroDocumento: 'AB1234' };
    await expect(service.crearPublico('m1', { ...base, ...rep, repTipoDocumento: 'PASAPORTE' }, ip)).resolves.toMatchObject({ ok: true });
    await expect(service.crearPublico('m1', { ...base, ...rep, repTipoDocumento: 'CE' }, ip)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('(8) un error distinto de P2002 se propaga sin reintentar', async () => {
    const { service, create } = setup({ createErrors: [new Error('db caída')] });
    await expect(service.crearPublico('m1', base, '10.9.0.3')).rejects.toThrow('db caída');
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('(8) tres P2002 seguidos → falla', async () => {
    const { service, create } = setup({ createErrors: [{ code: 'P2002' }, { code: 'P2002' }, { code: 'P2002' }] });
    await expect(service.crearPublico('m1', base, '10.9.0.4')).rejects.toMatchObject({ code: 'P2002' });
    expect(create).toHaveBeenCalledTimes(3);
  });
});

describe('LibroReclamacionesService.consultar', () => {
  const hoja = {
    id: 'h1', codigo: 'LR-0001-2026', tipo: 'RECLAMO', estado: 'RECIBIDO', nroDocumento: 'AB12345678',
    fecha: new Date(), fechaLimite: new Date(), respuesta: null, respondidoAt: null,
  };

  it('(i) devuelve solo con documento coincidente (case-insensitive)', async () => {
    const { service, prisma } = setup();
    prisma.hojaReclamacion.findFirst.mockResolvedValue(hoja as never);
    const r = await service.consultar('m1', ' lr-0001-2026 ', ' ab12345678 ');
    expect(r).toMatchObject({ codigo: 'LR-0001-2026', estado: 'RECIBIDO' });
    expect(r).not.toHaveProperty('nroDocumento');
    expect(prisma.hojaReclamacion.findFirst.mock.calls[0][0].where).toMatchObject({ marcaId: 'm1', codigo: 'LR-0001-2026' });
  });

  it('(i) documento distinto o código inexistente → mismo NotFound', async () => {
    const { service, prisma } = setup();
    prisma.hojaReclamacion.findFirst.mockResolvedValue(hoja as never);
    await expect(service.consultar('m1', 'LR-0001-2026', '99999999')).rejects.toThrow('No encontramos una hoja con esos datos');
    prisma.hojaReclamacion.findFirst.mockResolvedValue(null as never);
    await expect(service.consultar('m1', 'LR-0009-2026', 'x')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('LibroReclamacionesService.responder', () => {
  it('(j) marca RESPONDIDO atómicamente, guarda autor y envía correo; segunda vez → BadRequest', async () => {
    const { service, prisma, mail } = setup();
    const h = { id: 'h1', marcaId: 'm1', codigo: 'LR-0001-2026', tipo: 'RECLAMO', email: 'a@b.pe', estado: 'RECIBIDO' };
    prisma.hojaReclamacion.findFirst.mockResolvedValue(h as never);
    await service.responder('m1', 'h1', { respuesta: 'Le devolveremos su dinero.' }, 'ag@fp.pe');
    const arg = prisma.hojaReclamacion.updateMany.mock.calls[0]![0] as { where: unknown; data: Record<string, unknown> };
    expect(arg.where).toEqual({ id: 'h1', marcaId: 'm1', estado: { not: 'RESPONDIDO' } });
    expect(arg.data).toMatchObject({ estado: 'RESPONDIDO', respondidoPor: 'ag@fp.pe', respuesta: 'Le devolveremos su dinero.' });
    expect(arg.data.respondidoAt).toBeInstanceOf(Date);
    expect(mail.sendRespuestaReclamo).toHaveBeenCalledWith('a@b.pe', expect.objectContaining({ codigo: 'LR-0001-2026' }));

    mail.sendRespuestaReclamo.mockClear();
    prisma.hojaReclamacion.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.responder('m1', 'h1', { respuesta: 'Otra respuesta larga' }, 'ag@fp.pe')).rejects.toThrow('Ya fue respondida');
    expect(mail.sendRespuestaReclamo).not.toHaveBeenCalled();
  });
});

describe('LibroReclamacionesService.list', () => {
  it('(6) combina estado y vencidas con AND y siempre filtra por marca', async () => {
    const { service, prisma } = setup();
    await service.list('m1', { estado: 'EN_PROCESO', vencidas: true });
    const where = prisma.hojaReclamacion.findMany.mock.calls[0]![0]!.where;
    expect(where).toMatchObject({ marcaId: 'm1', estado: 'EN_PROCESO' });
    expect(where.AND).toEqual([{ estado: { not: 'RESPONDIDO' } }, { fechaLimite: { lt: expect.any(Date) } }]);
  });
  it('sin filtros solo marcaId', async () => {
    const { service, prisma } = setup();
    await service.list('m1');
    expect(prisma.hojaReclamacion.findMany.mock.calls[0]![0]!.where).toEqual({ marcaId: 'm1' });
  });
});
