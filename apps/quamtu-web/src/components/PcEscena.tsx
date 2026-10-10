'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState, type ComponentProps } from 'react';

// three.js solo en el cliente (no SSR).
const PcScene = dynamic(() => import('./PcScene'), { ssr: false });

type Props = ComponentProps<typeof PcScene> & {
  /** Imagen fija de la escena: se ve al instante y se funde cuando el 3D ya está dibujado. */
  poster?: string;
  /** Monta el 3D cuando el navegador queda libre, no durante la carga inicial. */
  diferir?: boolean;
};

export default function PcEscena({ poster, diferir = false, className = '', ...props }: Props) {
  const [montar, setMontar] = useState(!diferir);
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    if (!diferir) return;
    const ir = () => setMontar(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(ir, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(ir, 1200);
    return () => clearTimeout(t);
  }, [diferir]);

  if (!poster) return montar ? <PcScene {...props} className={className} /> : <div className={className} />;

  return (
    <div className={`relative ${className}`}>
      {montar && <PcScene {...props} instantaneo className="absolute inset-0" onListo={() => setTimeout(() => setOculto(true), 900)} />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        fetchPriority="high"
        decoding="async"
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${oculto ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
}
