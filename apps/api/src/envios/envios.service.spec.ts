import { describe, expect, it, vi } from 'vitest';
import { EnviosService } from './envios.service.js';

const tarifa = (extra = {}) => ({ proveedor: 'SHALOM', departamento: 'Cusco', costo: 9, plazoDias: '3-4 días', sedes: [] as string[], ...extra });
const servicio = (t: unknown) => new EnviosService({ tarifaEnvio: { findFirst: vi.fn(async () => t) } } as never);

describe('EnviosService.cotizar', () => {
  it('rechaza un departamento sin tarifa activa', async () => {
    await expect(servicio(null).cotizar('m1', 'Cusco')).rejects.toThrow('No hay envío');
  });

  it('devuelve el costo del tarifario', async () => {
    const r = await servicio(tarifa()).cotizar('m1', 'Cusco');
    expect(r).toMatchObject({ costo: 9, plazo: '3-4 días', sede: null });
  });

  it('si hay agencias cargadas, exige una de la lista', async () => {
    const s = servicio(tarifa({ sedes: ['Shalom Cusco Centro'] }));
    await expect(s.cotizar('m1', 'Cusco')).rejects.toThrow('agencia');
    await expect(s.cotizar('m1', 'Cusco', 'Otra')).rejects.toThrow('agencia');
    expect((await s.cotizar('m1', 'Cusco', 'Shalom Cusco Centro')).sede).toBe('Shalom Cusco Centro');
  });
});
