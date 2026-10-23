'use client';

import { ArrowRight, FileText, Landmark, LayoutGrid } from 'lucide-react';
import SeccionTitulo from '@/components/SeccionTitulo';
import Espiral from '@/components/Espiral';
import BotonHex from '@/components/hex/BotonHex';
import Carrusel from '@/components/slider/Carrusel';

// Solo lo que consta en el brochure.
const diapositivas = [
  {
    claro: 'Especialistas en', rojo: 'bienes y servicios',
    texto: 'Organización comercial especializada en el sector Corporativo y Gobierno, con el respaldo de las marcas más representativas del segmento tecnológico.',
    fondo: '/fotos/escritorios-2.jpg',
    botones: [{ href: '/cotizar', icono: FileText, texto: 'Solicitar cotización' }, { href: '/catalogo', icono: LayoutGrid, texto: 'Ver catálogo', contorno: true }],
  },
  {
    claro: 'Tecnología para el Estado', rojo: 'y las empresas',
    texto: 'Desarrollamos soluciones tecnológicas según la necesidad de cada entidad, con equipos de las marcas más comerciales del mercado.',
    fondo: '/fotos/servidores-1.jpg',
    botones: [{ href: '/catalogo', icono: LayoutGrid, texto: 'Ver catálogo' }],
  },
  {
    claro: 'Estamos en', rojo: 'Perú Compras',
    texto: 'Venta de bienes y servicios y postventa B2G, con presencia en Lima Metropolitana y los demás departamentos del país.',
    fondo: '/peru-compras/contenedor.jpg',
    botones: [{ href: '/peru-compras', icono: Landmark, texto: 'Conoce más' }, { href: '/cotizar', icono: FileText, texto: 'Cotizar', contorno: true }],
  },
  {
    claro: 'Impresión, redes', rojo: 'y más',
    texto: 'Impresión, networking, aire acondicionado, baterías, consumibles, mobiliario y papel para tu organización.',
    fondo: '/fotos/impresoras-2.jpg',
    botones: [{ href: '/catalogo', icono: ArrowRight, texto: 'Explorar categorías' }],
  },
];

export default function HeroSlider() {
  return (
    <section className="relative isolate min-h-svh overflow-hidden bg-[#111214]">
      <h1 className="sr-only">Fimav Perú — Especialistas en bienes y servicios</h1>
      <Carrusel
        etiqueta="Fimav Perú"
        auto={6000}
        fundido
        controlesFundido
        className="relative isolate mx-auto grid min-h-svh w-full max-w-none items-center px-4 pb-28 pt-28 sm:px-8 sm:pb-24 sm:pt-32 lg:px-16"
        visual={(activa) => (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#111214]">
            {diapositivas.map((d, i) => (
              <div key={d.fondo} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === activa ? 'opacity-100' : 'opacity-0'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.fondo} alt="" width={1600} height={1000} loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'low'} decoding="async" className="hero-fondo-imagen size-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(17_18_20/0.94)_0%,rgb(17_18_20/0.82)_44%,rgb(17_18_20/0.48)_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(17_18_20/0.82),transparent_46%,rgb(17_18_20/0.2))]" />
              </div>
            ))}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_82%_42%,rgb(224_36_36/0.22),transparent_38%)]" />
            <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute -right-[12%] top-[10%] w-[min(68vw,780px)] opacity-25">
              <path d="M50 4 94 27v46L50 96 6 73V27Z" fill="none" stroke="#e02424" strokeWidth="0.7" strokeLinejoin="round" />
            </svg>
            <Espiral contorno className="absolute -bottom-40 -right-36 w-[min(70vw,650px)] opacity-[0.14]" />
          </div>
        )}
        diapositivas={diapositivas.map((d) => (
          <div key={d.rojo} className="px-1 py-1">
            <SeccionTitulo nivel="h2" tam="lg" claroSobreOscuro claro={d.claro} rojo={d.rojo} className="max-w-3xl [&_h2]:text-[clamp(2.75rem,7vw,5.5rem)] [&_h2]:tracking-[0.035em]" />
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:mt-6 sm:text-xl">{d.texto}</p>
            <div className="mt-6 flex flex-wrap gap-3 sm:mt-9 sm:gap-4">
              {d.botones.map((b) => (
                <BotonHex key={b.texto} href={b.href} size="md" className="max-sm:flex-1 sm:!min-h-14 sm:!px-10 sm:!text-lg" icono={b.icono} variante={'contorno' in b ? 'contorno' : 'rojo'}>{b.texto}</BotonHex>
              ))}
            </div>
          </div>
        ))}
      />
    </section>
  );
}
