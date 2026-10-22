type Props = {
  claro: string;
  rojo?: string;
  subtitulo?: string;
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

/** Título de sección: display en mayúscula a dos tonos, barra roja corta y subtítulo fino (más ligero que el título). */
export default function SeccionTitulo({ claro, rojo, subtitulo, alineacion = 'izquierda', nivel: N, claroSobreOscuro = false, tam = 'md', className = '' }: Props) {
  const centro = alineacion === 'centro';
  return (
    <div className={`${centro ? 'text-center' : ''} ${className}`}>
      <N className={`font-display font-bold uppercase leading-[1.05] tracking-wide ${TAM[tam]}`}>
        <span className={claroSobreOscuro ? 'text-white/75' : 'text-carbon'}>{claro}</span>
        {claro && rojo ? ' ' : ''}
        {rojo && <span className={claroSobreOscuro ? 'text-white' : 'text-rojo'}>{rojo}</span>}
      </N>
      <span aria-hidden="true" className={`mt-3 block h-1 w-14 rounded-full bg-rojo ${centro ? 'mx-auto' : ''}`} />
      {subtitulo && (
        <p className={`mt-3 max-w-2xl font-titulo text-lg font-light leading-snug sm:text-xl ${centro ? 'mx-auto' : ''} ${claroSobreOscuro ? 'text-white/80' : 'text-carbon/80'}`}>{subtitulo}</p>
      )}
    </div>
  );
}
