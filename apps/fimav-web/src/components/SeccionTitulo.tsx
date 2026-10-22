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

/** Título de sección: subtítulo como sobretítulo (mayúscula, más pequeño) arriba, título display en mayúscula a dos tonos y barra roja corta debajo. */
export default function SeccionTitulo({ claro, rojo, subtitulo, alineacion = 'izquierda', nivel: N, claroSobreOscuro = false, tam = 'md', className = '' }: Props) {
  const centro = alineacion === 'centro';
  return (
    <div className={`${centro ? 'text-center' : ''} ${className}`}>
      {subtitulo && (
        // Sobretítulo corto: mayúscula con tracking. Frases largas: minúscula normal, más legible (mismos colores, AA).
        <p className={`mb-2 max-w-2xl leading-snug ${subtitulo.length <= 45 ? 'font-display text-sm font-semibold uppercase tracking-wide sm:text-base' : 'text-[15px] font-medium sm:text-base'} ${centro ? 'mx-auto' : ''} ${claroSobreOscuro ? 'text-white/80' : 'text-rojo-hondo'}`}>{subtitulo}</p>
      )}
      <N className={`font-display font-bold uppercase leading-[1.05] tracking-wide ${TAM[tam]}`}>
        <span className={claroSobreOscuro ? 'text-white/75' : 'text-carbon'}>{claro}</span>
        {claro && rojo ? ' ' : ''}
        {rojo && <span className={claroSobreOscuro ? 'text-white' : 'text-rojo'}>{rojo}</span>}
      </N>
      <span aria-hidden="true" className={`mt-3 block h-1 w-14 rounded-full bg-rojo ${centro ? 'mx-auto' : ''}`} />
    </div>
  );
}
