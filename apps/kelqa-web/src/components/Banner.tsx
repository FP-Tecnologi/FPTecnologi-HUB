import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type Props = { titulo: string; acento?: string; texto?: string; foto: string; miga: string };

/** Cabecera de las páginas interiores: foto con degradado tinta, migas de pan y título a dos tonos. */
export default function Banner({ titulo, acento, texto, foto, miga }: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-tinta text-white">
      <img fetchPriority="high" decoding="async" src={foto} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--color-tinta)_15%,rgb(14_28_30/0.8)_55%,rgb(19_106_111/0.35)_100%)]" />
      <img loading="lazy" decoding="async" src="/icon.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-16 -z-10 w-80 opacity-[0.08] grayscale brightness-[3]" />
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-36 sm:px-8 sm:pb-20 sm:pt-40">
        <nav aria-label="Migas de pan" className="entrada flex items-center gap-1.5 text-sm text-white/70">
          <Link href="/" className="transition hover:text-white">Inicio</Link>
          <ChevronRight aria-hidden="true" size={14} />
          <span aria-current="page" className="text-kelqa-claro">{miga}</span>
        </nav>
        <h1 className="entrada mt-4 max-w-3xl text-[clamp(2.2rem,5.5vw,3.75rem)] font-extrabold leading-[1.05] tracking-tight text-white" style={{ '--retraso': '100ms' } as React.CSSProperties}>
          {titulo}{acento && <> <span className="titulo-brillo titulo-brillo-claro">{acento}</span></>}
        </h1>
        {texto && <p className="entrada mt-5 max-w-2xl text-lg leading-relaxed text-white/85" style={{ '--retraso': '200ms' } as React.CSSProperties}>{texto}</p>}
      </div>
    </section>
  );
}
