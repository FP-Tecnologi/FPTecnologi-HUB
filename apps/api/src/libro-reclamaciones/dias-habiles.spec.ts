import { describe, expect, it } from 'vitest';
import { sumarDiasHabiles } from './dias-habiles.js';

const f = (s: string) => new Date(`${s}T12:00:00-05:00`);
const lima = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });

describe('sumarDiasHabiles', () => {
  it('lunes + 15 → lunes 3 semanas después', () => {
    expect(lima(sumarDiasHabiles(f('2026-10-19'), 15))).toBe('2026-11-09');
  });
  it('viernes + 1 → lunes', () => {
    expect(lima(sumarDiasHabiles(f('2026-10-23'), 1))).toBe('2026-10-26');
  });
  it('sábado + 1 → lunes', () => {
    expect(lima(sumarDiasHabiles(f('2026-10-24'), 1))).toBe('2026-10-26');
  });
  it('+ 0 → misma fecha', () => {
    expect(lima(sumarDiasHabiles(f('2026-10-24'), 0))).toBe('2026-10-24');
  });
  it('domingo 20:00 Lima (lunes 01:00Z) + 15 → viernes 13/11 en Lima', () => {
    expect(lima(sumarDiasHabiles(new Date('2026-10-26T01:00:00Z'), 15))).toBe('2026-11-13');
  });
  it('viernes 20:00 Lima (sábado 01:00Z) + 1 → lunes en Lima', () => {
    expect(lima(sumarDiasHabiles(new Date('2026-10-24T01:00:00Z'), 1))).toBe('2026-10-26');
  });
  it('conserva la hora del día', () => {
    expect(sumarDiasHabiles(new Date('2026-10-19T17:30:00Z'), 1).toISOString()).toBe('2026-10-20T17:30:00.000Z');
  });
});
