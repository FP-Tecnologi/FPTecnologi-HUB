type Props = { etiqueta: string; solido: string; acento: string; centro?: boolean; oscuro?: boolean; className?: string };

/** Título de sección al estilo del brochure: rótulo con cubito, título grueso con la palabra clave en rojo y filete metálico. */
export default function Titulo({ etiqueta, solido, acento, centro, oscuro, className = '' }: Props) {
  return (
    <div className={`${centro ? 'text-center' : ''} ${className}`}>
      <p className={`inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] ${oscuro ? 'text-rojo-claro' : 'text-rojo-hondo'}`}>
        <span aria-hidden="true" className="cubito" />{etiqueta}
      </p>
      <h2 className={`mt-3 text-[clamp(1.9rem,4.4vw,3rem)] font-extrabold leading-[1.08] tracking-tight ${oscuro ? 'text-white' : ''}`}>
        {solido} <span className={`titulo-brillo ${oscuro ? 'titulo-brillo-claro' : ''}`}>{acento}</span>
      </h2>
      <span aria-hidden="true" className={`rojo-filete mt-5 block h-1.5 w-24 ${centro ? 'mx-auto' : ''}`} />
    </div>
  );
}
