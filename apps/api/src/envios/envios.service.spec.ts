import { describe, expect, it, vi } from 'vitest';
import { EnviosService } from './envios.service.js';
import { agenciasCercanas, agenciasDeProvincia, limpiarTexto, provinciasConAgencias } from './agencias-shalom.js';

const tarifa = (extra = {}) => ({ proveedor: 'SHALOM', departamento: 'Cusco', costo: 9, plazoDias: '3-4 días', ...extra });
const sinVivas = { agenciasDeDepartamento: async () => null, cercanas: async () => null, resolverViva: () => undefined };
const servicio = (t: unknown, vivas: unknown = sinVivas) =>
  new EnviosService({ tarifaEnvio: { findFirst: vi.fn(async () => t) } } as never, vivas as never);

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

  it('acepta una agencia viva (shalom:<ter_id>) registrada por el provider', async () => {
    const viva = { id: 'shalom:392', departamento: 'Lima', provincia: 'Lima', zona: 'MALVINAS', direccion: 'JR. GARCIA VILLON 250', telefono: null, horario: '', lat: -12.04, lng: -77.04 };
    const vivas = { ...sinVivas, resolverViva: (id: string) => (id === viva.id ? viva : undefined) };
    const r = await servicio(tarifa({ departamento: 'Lima' }), vivas).cotizar('m1', 'Lima', 'shalom:392');
    expect(r.sede).toContain('MALVINAS');
    await expect(servicio(tarifa({ departamento: 'Lima' }), vivas).cotizar('m1', 'Lima', 'shalom:999')).rejects.toThrow('agencia');
  });

  it('lista provincias y agencias: primero las vivas, si no las estáticas', async () => {
    const viva = { id: 'shalom:18', departamento: 'Cusco', provincia: 'Cusco', zona: 'CENTRO', direccion: 'AV. SOL 123', telefono: null, horario: '', lat: -13.5, lng: -71.97 };
    const vivas = { ...sinVivas, agenciasDeDepartamento: async () => [viva] };
    const s = servicio(tarifa(), vivas);
    expect(await s.provincias('cusco')).toEqual([{ provincia: 'Cusco', agencias: 1 }]);
    expect(await s.agencias('cusco', 'CUSCO')).toEqual([viva]);
    // Sin vivas: cae al directorio estático.
    expect((await servicio(tarifa()).provincias('cusco')).length).toBeGreaterThan(0);
    expect((await servicio(tarifa()).agencias('cusco', 'Cusco')).length).toBeGreaterThan(0);
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

  it('busca solo entre los departamentos con envío (lista) y entiende Lambayeque, no la ciudad', () => {
    const r = agenciasCercanas(-6.77, -79.84, 5, ['lambayeque', 'Cusco']); // Chiclayo
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((a) => ['Lambayeque', 'Cusco'].includes(a.departamento))).toBe(true);
    expect(agenciasCercanas(-12.04, -77.04, 5, ['Chiclayo'])).toEqual([]); // "Chiclayo" no es un departamento
  });

  it('lista provincias y agencias sin importar tildes', () => {
    expect(provinciasConAgencias('ancash').length).toBeGreaterThan(0);
    const prov = provinciasConAgencias('Cajamarca')[0].provincia;
    expect(agenciasDeProvincia('cajamarca', prov.toUpperCase()).length).toBeGreaterThan(0);
  });
});

describe('limpiarTexto', () => {
  it('arregla los símbolos dañados de las fuentes de Shalom', () => {
    expect(limpiarTexto('AV. JOSE PARDO N?533')).toBe('AV. JOSE PARDO N° 533');
    expect(limpiarTexto('PRADO ESTE N? 1810 - EST.')).toBe('PRADO ESTE N° 1810 - EST.');
    expect(limpiarTexto('MIGUEL GRAUÂ MZ. A')).toBe('MIGUEL GRAU MZ. A');
    expect(limpiarTexto('GARCIA VILLóN')).toBe('GARCIA VILLÓN');
    expect(limpiarTexto('Convenci�n')).toBe('Convencin');
    expect(limpiarTexto('Lunes a viernes de 8:00 a. m. a 8:00 p. m. ¿Dónde?')).toBe('Lunes a viernes de 8:00 a. m. a 8:00 p. m. ¿Dónde?'); // no toca texto sano
  });
});
