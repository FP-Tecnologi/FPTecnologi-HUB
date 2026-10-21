import { redondear } from './rutaHexagono';

// Pestaña centrada con hombros a 30° (la mitad de un hexágono de punta arriba con la cima plana), vértices redondeados.
// "slice" + alto fijo: a menos de 2400 px de ancho la forma no se deforma, solo se recorta a los lados.
const W = 2400, H = 40, C = W / 2;
const ruta = (base: number) => {
  const cima = base - H * Math.sqrt(3);
  return `${redondear([[0, H], [C - base, H], [C - cima, 0], [C + cima, 0], [C + base, H], [W, H]], 22, false)}Z`;
};
const RUTAS = [[ruta(130), 'block sm:hidden'], [ruta(300), 'hidden sm:block']] as const;

/** Borde de sección: va justo encima (lado="arriba") o debajo (lado="abajo") de una sección del color dado. */
export default function CorteHex({ lado, color }: { lado: 'arriba' | 'abajo'; color: string }) {
  return RUTAS.map(([d, vista]) => (
    <svg key={vista} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true" className={`${vista} h-10 w-full ${lado === 'arriba' ? '-mb-px' : '-mt-px -scale-y-100'}`}>
      <path d={d} fill={color} />
    </svg>
  ));
}
