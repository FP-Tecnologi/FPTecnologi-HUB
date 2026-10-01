import { afterEach, describe, expect, it, vi } from 'vitest';
import { consultasDe, geocodificar } from './geocodificar.js';

afterEach(() => vi.unstubAllGlobals());

describe('consultasDe', () => {
  it('va de la dirección completa a zonas más amplias, sin repetir', () => {
    expect(consultasDe('Jr. Huaraz 1841,  Breña, Lima')).toEqual([
      { q: 'Jr. Huaraz 1841, Breña, Lima, Perú', aproximada: false },
      { q: 'Breña, Lima, Perú', aproximada: true },
      { q: 'Lima, Perú', aproximada: true },
    ]);
    expect(consultasDe('Chiclayo')).toEqual([{ q: 'Chiclayo, Perú', aproximada: false }]);
  });
});

describe('geocodificar', () => {
  it('si la dirección exacta no existe usa la zona y avisa que es aproximada', async () => {
    const respuestas = [[], [{ lat: '-12.0597', lon: '-77.0501', display_name: 'Breña, Lima, Lima Metropolitana, Perú' }]];
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => respuestas.shift() ?? [] })));
    const r = await geocodificar('Calle Inventada 99, Breña, Lima', 'ip-1');
    expect(r).toMatchObject({ aproximada: true, lat: -12.0597 });
    expect(r!.lugar).toContain('Breña');
  }, 10_000);

  it('rechaza puntos fuera de Perú y textos vacíos', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => [{ lat: '40.4', lon: '-3.7', display_name: 'Madrid' }] })));
    expect(await geocodificar('Calle Falsa 123 Madrid', 'ip-2')).toBeNull();
    await expect(geocodificar('ab', 'ip-3')).rejects.toThrow('dirección');
  }, 15_000);
});
