import { describe, expect, it } from 'vitest';
import { agenciaEnDistrito, codigoDistrito, distritosDe } from './ubigeo.js';

describe('ubigeo', () => {
  it('lista los distritos de una provincia sin importar tildes y mayúsculas', () => {
    const d = distritosDe('lima', 'LIMA');
    expect(d).toContain('Breña');
    expect(d).toContain('Miraflores');
    expect(d.length).toBe(43);
    expect(distritosDe('Inventado', 'Lima')).toEqual([]);
  });

  it('da el código INEI del distrito (Miraflores de Lima = 150122, no el de otros departamentos)', () => {
    expect(codigoDistrito('Lima', 'Lima', 'miraflores')).toBe('150122');
    expect(codigoDistrito('Arequipa', 'Arequipa', 'Miraflores')).toBe('040110');
  });
});

describe('agenciaEnDistrito', () => {
  it('con código ubigeo compara el código exacto', () => {
    expect(agenciaEnDistrito({ zona: 'LARCOMAR', direccion: '', ubigeo: '150122' }, 'Miraflores', '150122')).toBe(true);
    expect(agenciaEnDistrito({ zona: 'ATOCONGO', direccion: '', ubigeo: '150133' }, 'Miraflores', '150122')).toBe(false);
  });

  it('sin código usa la zona y el "DISTRITO - PROVINCIA" de la dirección, sin confundir San Juan de Miraflores', () => {
    expect(agenciaEnDistrito({ zona: 'BREÑA', direccion: '' }, 'Breña')).toBe(true);
    expect(agenciaEnDistrito({ zona: 'CERCADO LIMA', direccion: '' }, 'Lima')).toBe(true);
    expect(agenciaEnDistrito({ zona: 'X', direccion: 'AV. ABC 123, MIRAFLORES - LIMA' }, 'Miraflores')).toBe(true);
    expect(agenciaEnDistrito({ zona: 'ATOCONGO', direccion: 'AV. XYZ, SAN JUAN DE MIRAFLORES - LIMA' }, 'Miraflores')).toBe(false);
  });
});
