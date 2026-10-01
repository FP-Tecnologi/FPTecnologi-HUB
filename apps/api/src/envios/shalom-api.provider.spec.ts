import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShalomApiProvider } from './shalom-api.provider.js';

const viva = (extra = {}) => ({
  ter_id: 392,
  ter_abrebiatura: 'MLGVLL',
  zona: 'CERCADO LIMA',
  ter_zona: 'LIMA OESTE 2',
  provincia: 'LIMA',
  departamento: 'LIMA',
  lugar_over: 'MALVINAS - JR. GARCIA VILLON',
  latitud: '-12.04638719585',
  longitud: '-77.049473000003',
  direccion: 'JR. GARCIA VILLON 250',
  telefono: '(01) 500 7878',
  hora_atencion: 'LUNES A VIERNES - 8AM A 8PM',
  ter_aereo: 1,
  ...extra,
});

const mockFetch = (data: unknown, ok = true) =>
  vi.fn(async (_url: unknown) => ({ ok, json: async () => ({ success: true, total: 1, returned: 1, data }) }));

afterEach(() => vi.unstubAllGlobals());

describe('ShalomApiProvider', () => {
  it('mapea un registro vivo a la forma canónica y lo registra para cotizar', async () => {
    vi.stubGlobal('fetch', mockFetch([viva()]));
    const p = new ShalomApiProvider();
    const r = await p.agenciasDeDepartamento('lima');
    expect(r).toHaveLength(1);
    expect(r![0]).toMatchObject({ id: 'shalom:392', departamento: 'Lima', provincia: 'Lima', zona: 'MALVINAS - JR. GARCIA VILLON', lat: -12.04638719585 });
    expect(p.resolverViva('shalom:392')).toMatchObject({ id: 'shalom:392' });
    expect(p.resolverViva('shalom:1')).toBeUndefined();
  });

  it('descarta registros de otro departamento y sin ter_id', async () => {
    vi.stubGlobal('fetch', mockFetch([viva(), viva({ ter_id: 7, departamento: 'AREQUIPA', provincia: 'AREQUIPA' }), { departamento: 'LIMA' }]));
    const p = new ShalomApiProvider();
    expect(await p.agenciasDeDepartamento('Lima')).toHaveLength(1);
  });

  it('devuelve null si la API falla (red, !ok o forma rara) para usar el estático', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('caída'); }));
    expect(await new ShalomApiProvider().agenciasDeDepartamento('Lima')).toBeNull();
    vi.stubGlobal('fetch', mockFetch([], false));
    expect(await new ShalomApiProvider().agenciasDeDepartamento('Lima')).toBeNull();
    vi.stubGlobal('fetch', mockFetch({ raro: true }));
    expect(await new ShalomApiProvider().agenciasDeDepartamento('Lima')).toBeNull();
    vi.stubGlobal('fetch', mockFetch([viva()]));
    expect(await new ShalomApiProvider().agenciasDeDepartamento('Inventado')).toBeNull();
  });

  it('cachea el directorio: dos llamadas, un solo fetch', async () => {
    const f = mockFetch([viva()]);
    vi.stubGlobal('fetch', f);
    const p = new ShalomApiProvider();
    await p.agenciasDeDepartamento('Lima');
    await p.agenciasDeDepartamento('LIMA');
    expect(f).toHaveBeenCalledTimes(1);
    expect(String(f.mock.calls[0]?.[0] ?? '')).toContain('/public/agencies/search?');
  });

  it('cercanas usa la distancia de la API y ordena', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch([viva({ ter_id: 1, distancia_km: 5 }), viva({ ter_id: 2, lugar_over: 'LEJOS', distancia_km: 30 })]),
    );
    const p = new ShalomApiProvider();
    const r = await p.cercanas(-12.0464, -77.0428, 5);
    expect(r!.map((a) => a.id)).toEqual(['shalom:1', 'shalom:2']);
    expect(r![0].distanciaKm).toBe(5);
  });
});
