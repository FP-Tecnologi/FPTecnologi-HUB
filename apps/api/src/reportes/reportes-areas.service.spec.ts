import { describe, expect, it } from 'vitest';
import { contarPorDia, etiquetasDias, rangoPrevio, ranking } from './reportes-areas.service.js';
import { resolverRango } from './reportes.service.js';

describe('reportes por área · helpers', () => {
  const r = resolverRango('2026-10-01', '2026-10-03');

  it('contarPorDia rellena con 0 y usa el día de Lima', () => {
    const fechas = [new Date('2026-10-01T10:00:00Z'), new Date('2026-10-01T12:00:00Z'), new Date('2026-10-04T03:00:00Z') /* 3-oct 22:00 Lima */, new Date('2026-09-30T20:00:00Z') /* fuera */];
    expect(contarPorDia(fechas, r)).toEqual([2, 0, 1]);
  });

  it('etiquetasDias lista cada día del rango', () => {
    expect(etiquetasDias(r)).toEqual(['2026-10-01', '2026-10-02', '2026-10-03']);
  });

  it('rangoPrevio termina justo antes del inicio y dura lo mismo', () => {
    const p = rangoPrevio(r);
    expect(p.hasta.getTime()).toBe(r.desde.getTime() - 1);
    expect(etiquetasDias(p)).toEqual(['2026-09-28', '2026-09-29', '2026-09-30']);
  });

  it('ranking agrupa, ordena y rellena vacíos', () => {
    expect(ranking(['/a', '/b', '/a', null, ' '], 'Directo')).toEqual([['/a', 2], ['Directo', 2], ['/b', 1]]);
  });
});
