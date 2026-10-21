import { describe, expect, it } from 'vitest';
import { sumarDiasHabiles } from './dias-habiles.js';

const f = (s: string) => new Date(`${s}T12:00:00`);
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

describe('sumarDiasHabiles', () => {
  it('lunes + 15 → martes 3 semanas después', () => {
    expect(ymd(sumarDiasHabiles(f('2026-10-19'), 15))).toBe('2026-11-09');
  });
  it('viernes + 1 → lunes', () => {
    expect(ymd(sumarDiasHabiles(f('2026-10-23'), 1))).toBe('2026-10-26');
  });
  it('sábado + 1 → lunes', () => {
    expect(ymd(sumarDiasHabiles(f('2026-10-24'), 1))).toBe('2026-10-26');
  });
  it('+ 0 → misma fecha', () => {
    expect(ymd(sumarDiasHabiles(f('2026-10-24'), 0))).toBe('2026-10-24');
  });
});
