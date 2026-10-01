import { describe, expect, it, vi } from 'vitest';
import { EnviosService } from './envios.service.js';
import { agenciasCercanas, agenciasDeProvincia, provinciasConAgencias } from './agencias-shalom.js';

const tarifa = (extra = {}) => ({ proveedor: 'SHALOM', departamento: 'Cusco', costo: 9, plazoDias: '3-4 días', ...extra });
const servicio = (t: unknown) => new EnviosService({ tarifaEnvio: { findFirst: vi.fn(async () => t) } } as never);

describe('EnviosService.cotizar', () => {
  it('rechaza un departamento sin tarifa activa', async () => {
    await expect(servicio(null).cotizar('m1', 'Cusco')).rejects.toThrow('No hay envío');
  });

  it('exige una agencia Shalom del departamento', async () => {
    const s = servicio(tarifa());
    await expect(s.cotizar('m1', 'Cusco')).rejects.toThrow('agencia');
    await expect(s.cotizar('m1', 'Cusco', 'inventada')).rejects.toThrow('agencia');
    const lima = agenciasCercanas(-12.05, -77.04, 1, 'Lima')[0];
    await expect(s.cotizar('m1', 'Cusco', lima.id)).rejects.toThrow('agencia'); // agencia de otro departamento
  });

  it('devuelve costo del tarifario y la agencia elegida', async () => {
    const cusco = agenciasCercanas(-13.52, -71.97, 1, 'Cusco')[0];
    const r = await servicio(tarifa()).cotizar('m1', 'Cusco', cusco.id);
    expect(r).toMatchObject({ costo: 9, plazo: '3-4 días' });
    expect(r.sede).toContain('Cusco');
  });
});

describe('directorio de agencias Shalom', () => {
  it('las más cercanas a Lima centro están en Lima y vienen ordenadas', () => {
    const r = agenciasCercanas(-12.0464, -77.0428, 5);
    expect(r).toHaveLength(5);
    expect(r[0].departamento).toBe('Lima');
    expect(r.map((a) => a.distanciaKm)).toEqual([...r.map((a) => a.distanciaKm)].sort((a, b) => a - b));
    expect(r[0].distanciaKm).toBeLessThan(10);
  });

  it('filtra por departamento aunque el punto esté lejos', () => {
    const r = agenciasCercanas(-12.0464, -77.0428, 3, 'arequipa');
    expect(r.every((a) => a.departamento === 'Arequipa')).toBe(true);
  });

  it('lista provincias y agencias sin importar tildes', () => {
    expect(provinciasConAgencias('ancash').length).toBeGreaterThan(0);
    const prov = provinciasConAgencias('Cajamarca')[0].provincia;
    expect(agenciasDeProvincia('cajamarca', prov.toUpperCase()).length).toBeGreaterThan(0);
  });
});
