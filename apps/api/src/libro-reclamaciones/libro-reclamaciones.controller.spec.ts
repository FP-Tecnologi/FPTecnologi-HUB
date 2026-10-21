import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { LibroReclamacionesController, PublicLibroReclamacionesController } from './libro-reclamaciones.controller.js';

const servicio = () => ({
  crearPublico: vi.fn(), consultar: vi.fn(), proveedor: vi.fn(), list: vi.fn(), get: vi.fn(), responder: vi.fn(),
});

describe('PublicLibroReclamacionesController', () => {
  it('crear sin marcaId -> BadRequest', () => {
    const c = new PublicLibroReclamacionesController(servicio() as never);
    expect(() => c.crear('', {} as never, '1.1.1.1')).toThrow(BadRequestException);
  });

  it('consulta sin codigo/documento -> BadRequest', () => {
    const c = new PublicLibroReclamacionesController(servicio() as never);
    expect(() => c.consultar('m1', undefined as never, 'x', '1.1.1.1')).toThrow(BadRequestException);
    expect(() => c.consultar('m1', 'c', undefined as never, '1.1.1.1')).toThrow(BadRequestException);
    expect(() => c.consultar('m1', 'c'.repeat(41), 'x', '1.1.1.1')).toThrow(BadRequestException);
  });

  it('consulta pasa la primera IP de x-forwarded-for como 4º argumento', () => {
    const s = servicio();
    new PublicLibroReclamacionesController(s as never).consultar('m1', 'C-1', '123', '9.9.9.9', '2.2.2.2, 3.3.3.3');
    expect(s.consultar).toHaveBeenCalledWith('m1', 'C-1', '123', '2.2.2.2');
  });
});

describe('LibroReclamacionesController', () => {
  it('list mapea vencidas=true a boolean y valida estado', () => {
    const s = servicio();
    const c = new LibroReclamacionesController(s as never);
    c.list('m1', 'RECIBIDO', 'true');
    expect(s.list).toHaveBeenCalledWith('m1', { estado: 'RECIBIDO', vencidas: true });
    c.list('m1', undefined, undefined);
    expect(s.list).toHaveBeenLastCalledWith('m1', { estado: undefined, vencidas: false });
    expect(() => c.list('m1', 'XYZ', undefined)).toThrow(BadRequestException);
  });
});
