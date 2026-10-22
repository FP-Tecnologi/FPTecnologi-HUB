// node scripts/ruta-hexagono.check.mts  (Node ≥22.18 quita los tipos solo)
import assert from 'node:assert/strict';
import { rutaHexagono, VERTICES } from '../src/components/hex/rutaHexagono.ts';

for (const orientacion of ['punta-arriba', 'punta-lado'] as const) {
  for (const radio of [0, 0.08, 0.3]) {
    const d = rutaHexagono({ orientacion, radio });
    const q = [...d.matchAll(/Q([\d.]+) ([\d.]+)/g)].map((m) => [+m[1], +m[2]]);
    assert.equal(q.length, 6, `${orientacion}: 6 vértices`);
    assert.deepEqual(q, VERTICES[orientacion], `${orientacion}: controles en los vértices`);
    for (const v of d.match(/-?[\d.]+/g)!.map(Number)) assert.ok(v >= 0 && v <= 1, `${orientacion} r=${radio}: ${v} fuera de [0,1]`);
    const pares = d.match(/[\d.]+ [\d.]+/g)!;
    const esVertice = (s: string) => VERTICES[orientacion].some((v) => v.join(' ') === s);
    if (radio === 0) assert.ok(pares.every(esVertice), `r=0 da exactamente los vértices: ${d}`);
    else assert.equal(pares.filter(esVertice).length, 6, 'r>0: solo los controles tocan los vértices');
  }
}
console.log('rutaHexagono ok');
