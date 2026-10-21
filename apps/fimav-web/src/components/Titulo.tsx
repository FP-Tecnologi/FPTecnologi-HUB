export default function Titulo({ claro, rojo, nivel: N = 'h2', className = '' }: { claro: string; rojo: string; nivel?: 'h1' | 'h2'; className?: string }) {
  return (
    <N className={`font-titulo font-normal leading-tight text-carbon ${className}`}>
      {claro} <span className="text-rojo">{rojo}</span>
    </N>
  );
}
