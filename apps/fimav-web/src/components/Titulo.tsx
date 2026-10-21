type Props = { claro: string; rojo: string; nivel?: 'h1' | 'h2'; className?: string; /** Entrada palabra por palabra (solo CSS, visible sin JS). */ palabras?: boolean };

export default function Titulo({ claro, rojo, nivel: N = 'h2', className = '', palabras = false }: Props) {
  if (!palabras) {
    return (
      <N className={`font-titulo font-normal leading-tight text-carbon ${className}`}>
        {claro} <span className="text-rojo">{rojo}</span>
      </N>
    );
  }
  const claras = claro.split(' ');
  const palabra = (p: string, i: number) => (
    <span key={i}>
      <span className="entrada inline-block" style={{ '--retraso': `${i * 80}ms` } as React.CSSProperties}>{p}</span>{' '}
    </span>
  );
  return (
    <N className={`font-titulo font-normal leading-tight text-carbon ${className}`}>
      {claras.map(palabra)}
      <span className="text-rojo">{rojo.split(' ').map((p, i) => palabra(p, claras.length + i))}</span>
    </N>
  );
}
