type Props = {
  claro: string;
  rojo?: string;
  /** Sobretítulo corto (la etiqueta de la sección). Es un <p>, no un encabezado. */
  eyebrow?: string;
  alineacion?: 'izquierda' | 'centro';
  nivel: 'h1' | 'h2' | 'h3';
  /** Sobre bandas carbón: el rojo #E02424 no llega a 3:1 contra el carbón, así que el contraste de dos tonos pasa a blanco pleno / blanco atenuado. */
  claroSobreOscuro?: boolean;
  tam?: 'lg' | 'md' | 'sm';
  className?: string;
};

const TAM = {
  lg: 'text-[clamp(2.25rem,6.5vw,3.5rem)]',
  md: 'text-[clamp(1.875rem,5vw,2.75rem)]',
  sm: 'text-[clamp(1.625rem,4vw,2rem)]',
};

/** Título de sección: etiqueta corta (eyebrow: pequeña, espaciada, mayúscula) arriba, título display grande a dos tonos (corto y directo) y barra roja corta debajo. */
export default function SeccionTitulo({ claro, rojo, eyebrow, alineacion = 'izquierda', nivel: N, claroSobreOscuro = false, tam = 'md', className = '' }: Props) {
  const centro = alineacion === 'centro';
  return (
    <div className={`${centro ? 'text-center' : ''} ${className}`}>
      {eyebrow && (
        <p className={`mb-2 font-display text-[13px] font-semibold uppercase leading-snug tracking-[0.16em] sm:text-sm ${centro ? 'mx-auto' : ''} ${claroSobreOscuro ? 'text-white/85' : 'text-rojo-hondo'}`}>{eyebrow}</p>
      )}
      <N className={`font-display font-extrabold uppercase leading-[1.05] tracking-wide text-balance ${TAM[tam]}`}>
        <span className={claroSobreOscuro ? 'text-white/75' : 'text-carbon'}>{claro}</span>
        {claro && rojo ? ' ' : ''}
        {rojo && <span className={claroSobreOscuro ? 'text-white' : 'text-rojo'}>{rojo}</span>}
      </N>
      <span aria-hidden="true" className={`mt-3 block h-1 w-14 rounded-full bg-rojo ${centro ? 'mx-auto' : ''}`} />
    </div>
  );
}
