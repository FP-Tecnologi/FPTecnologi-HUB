import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { LibroReclamacionesController, PublicLibroReclamacionesController } from './libro-reclamaciones.controller.js';

const servicio = () => ({
  crearPublico: vi.fn(), consultar: vi.fn(), proveedor: vi.fn(), list: vi.fn(), get: vi.fn(), responder: vi.fn(), actualizar: vi.fn(), resumen: vi.fn(),
});
const pub = (s = servicio()) => ({ s, c: new PublicLibroReclamacionesController(s as never) });

describe('PublicLibroReclamacionesController', () => {
  it.each([undefined, '', ['a', 'b'], 'x'.repeat(41)])('marcaId inválido (%j) -> BadRequest en crear, consulta y proveedor', (m) => {
    const { c } = pub();
    expect(() => c.crear(m as never, {} as never, '1.1.1.1')).toThrow(BadRequestException);
    expect(() => c.consultar(m as never, { codigo: 'c', documento: 'd' }, '1.1.1.1')).toThrow(BadRequestException);
    expect(() => c.proveedor(m as never)).toThrow(BadRequestException);
  });

  it('crear reenvía la primera IP de x-forwarded-for', () => {
    const { s, c } = pub();
    const dto = {} as never;
    c.crear('m1', dto, '9.9.9.9', '2.2.2.2, 3.3.3.3');
    expect(s.crearPublico).toHaveBeenCalledWith('m1', dto, '2.2.2.2');
    c.crear('m1', dto, '9.9.9.9');
    expect(s.crearPublico).toHaveBeenLastCalledWith('m1', dto, '9.9.9.9');
  });

  it('consulta pasa codigo, documento y la primera IP como 4º argumento', () => {
    const { s, c } = pub();
    c.consultar('m1', { codigo: 'C-1', documento: '123' }, '9.9.9.9', '2.2.2.2, 3.3.3.3');
    expect(s.consultar).toHaveBeenCalledWith('m1', 'C-1', '123', '2.2.2.2');
  });

  it('proveedor delega con marcaId válido', () => {
    const { s, c } = pub();
    c.proveedor('m1');
    expect(s.proveedor).toHaveBeenCalledWith('m1');
  });
});

describe('LibroReclamacionesController', () => {
  it('list mapea vencidas=true a boolean y valida estado', () => {
    const s = servicio();
    const c = new LibroReclamacionesController(s as never);
    c.list('m1', 'RECIBIDO', 'true');
    expect(s.list).toHaveBeenCalledWith('m1', { estado: 'RECIBIDO', vencidas: true, q: undefined });
    c.list('m1', undefined, undefined);
    expect(s.list).toHaveBeenLastCalledWith('m1', { estado: undefined, vencidas: false, q: undefined });
    expect(() => c.list('m1', 'XYZ', undefined)).toThrow(BadRequestException);
  });

  it('responder delega con el email del usuario', () => {
    const s = servicio();
    const dto = { respuesta: 'Texto de respuesta' };
    new LibroReclamacionesController(s as never).responder('m1', 'h1', dto, { email: 'a@b.pe' } as never);
    expect(s.responder).toHaveBeenCalledWith('m1', 'h1', dto, 'a@b.pe');
  });

  it('list pasa q y rechaza q de más de 60 caracteres', () => {
    const s = servicio();
    const c = new LibroReclamacionesController(s as never);
    c.list('m1', undefined, undefined, 'ana');
    expect(s.list).toHaveBeenCalledWith('m1', { estado: undefined, vencidas: false, q: 'ana' });
    expect(() => c.list('m1', undefined, undefined, 'x'.repeat(61))).toThrow(BadRequestException);
    expect(() => c.list('m1', undefined, undefined, ['a', 'b'] as never)).toThrow(BadRequestException);
  });

  it('resumen delega con la marca', () => {
    const s = servicio();
    new LibroReclamacionesController(s as never).resumen('m1');
    expect(s.resumen).toHaveBeenCalledWith('m1');
  });

  it('resumen se declara antes que :id', () => {
    const orden = Object.getOwnPropertyNames(LibroReclamacionesController.prototype);
    expect(orden.indexOf('resumen')).toBeLessThan(orden.indexOf('get'));
  });

  it('actualizar delega con el email del usuario', () => {
    const s = servicio();
    const dto = { estado: 'EN_PROCESO' as const };
    new LibroReclamacionesController(s as never).actualizar('m1', 'h1', dto, { email: 'a@b.pe' } as never);
    expect(s.actualizar).toHaveBeenCalledWith('m1', 'h1', dto, 'a@b.pe');
  });
});
