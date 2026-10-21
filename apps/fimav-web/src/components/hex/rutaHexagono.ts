export type Punto = [number, number];
const n = (v: number) => +v.toFixed(4);

/** Path SVG que recorre los puntos redondeando cada vértice (curva cuadrática a distancia r del vértice).
 *  Abierto: el primer y el último punto quedan tal cual y el path no se cierra. */
export function redondear(p: Punto[], r: number, cerrado = true): string {
  const k = p.length;
  const idx = cerrado ? p.map((_, i) => i) : p.slice(1, -1).map((_, i) => i + 1);
  let d = cerrado ? '' : `M${n(p[0][0])} ${n(p[0][1])}`;
  for (const i of idx) {
    const v = p[i];
    const hacia = (o: Punto) => {
      const t = Math.min(r / Math.hypot(o[0] - v[0], o[1] - v[1]), 0.5);
      return `${n(v[0] + (o[0] - v[0]) * t)} ${n(v[1] + (o[1] - v[1]) * t)}`;
    };
    d += `${d ? 'L' : 'M'}${hacia(p[(i - 1 + k) % k])}Q${n(v[0])} ${n(v[1])} ${hacia(p[(i + 1) % k])}`;
  }
  return cerrado ? `${d}Z` : `${d}L${n(p[k - 1][0])} ${n(p[k - 1][1])}`;
}

export const VERTICES = {
  'punta-arriba': [[0.5, 0], [1, 0.25], [1, 0.75], [0.5, 1], [0, 0.75], [0, 0.25]],
  'punta-lado': [[0, 0.5], [0.25, 0], [0.75, 0], [1, 0.5], [0.75, 1], [0.25, 1]],
} satisfies Record<string, Punto[]>;

/** Hexágono con vértices redondeados en coordenadas objectBoundingBox (0–1). */
export const rutaHexagono = ({ orientacion, radio }: { orientacion: keyof typeof VERTICES; radio: number }) =>
  redondear(VERTICES[orientacion] as Punto[], radio);
