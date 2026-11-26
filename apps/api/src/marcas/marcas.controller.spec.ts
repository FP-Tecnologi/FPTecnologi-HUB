import { describe, expect, it, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { MarcasController } from './marcas.controller.js';

const usuario = { sub: 'u1', email: 'admin@kelqa.pe', marcas: [{ marcaId: 'kelqa', rol: 'admin' }] };
const montar = () => {
  const servicio = { findOne: vi.fn(async () => ({})), update: vi.fn(async () => ({ nombre: 'Kelqa' })) };
  const controlador = new MarcasController(servicio as never, { registrar: vi.fn() } as never);
  return { servicio, controlador };
};

describe('MarcasController: cada admin solo toca su marca', () => {
  it('no deja leer ni editar otra marca enviando la cabecera de la propia', () => {
    const { servicio, controlador } = montar();
    expect(() => controlador.findOne('kelqa', 'fptecnologi')).toThrow(ForbiddenException);
    expect(() => controlador.update('kelqa', usuario as never, 'fptecnologi', {} as never)).toThrow(ForbiddenException);
    expect(servicio.findOne).not.toHaveBeenCalled();
    expect(servicio.update).not.toHaveBeenCalled();
  });

  it('edita la marca activa', async () => {
    const { servicio, controlador } = montar();
    await controlador.update('kelqa', usuario as never, 'kelqa', {} as never);
    expect(servicio.update).toHaveBeenCalledWith('kelqa', {});
  });
});
