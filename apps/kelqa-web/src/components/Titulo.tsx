type Props = { etiqueta: string; solido: string; acento: string; centro?: boolean; oscuro?: boolean; className?: string };

/** Título de sección: etiqueta tipo insignia + h2 a dos tonos en una línea (la parte acento con brillo turquesa). */
export default function Titulo({ etiqueta, solido, acento, centro, oscuro, className = '' }: Props) {
  return (
    <div className={`${centro ? 'text-center' : ''} ${className}`}>
      <p className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] ${oscuro ? 'bg-white/10 text-kelqa-claro' : 'bg-kelqa/10 text-kelqa-hondo'}`}>
        <span aria-hidden="true" className="latir size-2 rounded-[3px] bg-current" />
        {etiqueta}
      </p>
      <h2 className={`mt-4 text-[clamp(1.9rem,4.4vw,3rem)] font-extrabold leading-[1.08] tracking-tight ${oscuro ? 'text-white' : ''}`}>
        {solido} <span className={`titulo-brillo ${oscuro ? 'titulo-brillo-claro' : ''}`}>{acento}</span>
      </h2>
    </div>
  );
}
