import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type Props = { titulo: string; acento?: string; texto?: string; foto: string; miga: string };

/** Portada de página interior, como las portadas de línea del brochure: foto a sangre, título abajo a la izquierda y filete metálico. */
export default function Banner({ titulo, acento, texto, foto, miga }: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-tinta text-white">
      <img fetchPriority="high" decoding="async" src={foto} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,var(--color-tinta)_4%,rgb(13_13_14/0.55)_45%,rgb(13_13_14/0.75)_100%)]" />
      <div className="mx-auto flex min-h-[26rem] max-w-7xl flex-col justify-between px-5 pb-12 pt-28 sm:min-h-[32rem] sm:px-8">
        <nav aria-label="Migas de pan" className="entrada flex items-center gap-1.5 text-sm text-white/75">
          <Link href="/" className="transition hover:text-white">Inicio</Link>
          <ChevronRight aria-hidden="true" size={14} />
          <span aria-current="page" className="text-rojo-claro">{miga}</span>
        </nav>
        <div>
          <h1 className="entrada max-w-4xl text-[clamp(2.2rem,6vw,4.25rem)] font-black leading-[1.02] tracking-tight text-white" style={{ '--retraso': '100ms' } as React.CSSProperties}>
            {titulo}{acento && <> <span className="titulo-brillo-claro">{acento}</span></>}
          </h1>
          {texto && <p className="entrada mt-4 max-w-2xl text-lg leading-relaxed text-white/90" style={{ '--retraso': '200ms' } as React.CSSProperties}>{texto}</p>}
        </div>
      </div>
      <div aria-hidden="true" className="metal h-1.5" /><div aria-hidden="true" className="rojo-filete h-1.5" />
    </section>
  );
}
