'use client';

import { ArrowRight, ChevronDown, FileText, Landmark, LayoutGrid } from 'lucide-react';
import SeccionTitulo from '@/components/SeccionTitulo';
import Espiral from '@/components/Espiral';
import HexImagen from '@/components/hex/HexImagen';
import BotonHex from '@/components/hex/BotonHex';
import Carrusel from '@/components/slider/Carrusel';

// Solo lo que consta en el brochure.
const diapositivas = [
  {
    claro: 'Tecnología para', rojo: 'cada organización',
    subtitulo: 'Tecnología para cada espacio de trabajo',
    texto: 'Organización comercial especializada en el sector Corporativo y Gobierno, con el respaldo de las marcas más representativas del segmento tecnológico.',
    imagenIzquierda: '/fotos/escritorios-1.jpg', imagenDerecha: '/fotos/all-in-one-1.jpg',
    fondo: '/fotos/escritorios-2.jpg',
    botones: [{ href: '/cotizar', icono: FileText, texto: 'Solicitar cotización' }, { href: '/catalogo', icono: LayoutGrid, texto: 'Ver catálogo', contorno: true }],
  },
  {
    claro: 'Soluciones para', rojo: 'el Estado',
    subtitulo: 'Infraestructura que conecta y sostiene tu operación',
    texto: 'Desarrollamos soluciones tecnológicas según la necesidad de cada entidad, con equipos de las marcas más comerciales del mercado.',
    imagenIzquierda: '/fotos/networking-1.jpg', imagenDerecha: '/fotos/servidores-1.jpg',
    fondo: '/fotos/servidores-1.jpg',
    botones: [{ href: '/catalogo', icono: LayoutGrid, texto: 'Ver catálogo' }],
  },
  {
    claro: 'Atención a', rojo: 'Perú Compras',
    subtitulo: 'Soluciones para entidades del sector público',
    texto: 'Venta de bienes y servicios y postventa B2G, con presencia en Lima Metropolitana y los demás departamentos del país.',
    imagenIzquierda: '/fotos/proyectores-1.jpg', imagenDerecha: '/fotos/impresoras-1.jpg',
    fondo: '/peru-compras/contenedor.jpg',
    botones: [{ href: '/peru-compras', icono: Landmark, texto: 'Conoce más' }, { href: '/cotizar', icono: FileText, texto: 'Cotizar', contorno: true }],
  },
  {
    claro: 'Equipos para', rojo: 'tu empresa',
    subtitulo: 'Equipamiento para las necesidades de tu organización',
    texto: 'Impresión, networking, aire acondicionado, baterías, consumibles, mobiliario y papel para tu organización.',
    imagenIzquierda: '/fotos/impresoras-2.jpg', imagenDerecha: '/fotos/consumibles-1.jpg',
    fondo: '/fotos/impresoras-2.jpg',
    botones: [{ href: '/catalogo', icono: ArrowRight, texto: 'Explorar categorías' }],
  },
];

type Diapositiva = (typeof diapositivas)[number];

function GaleriaDiapositiva({ diapositiva }: { diapositiva: Diapositiva }) {
  return (
    <div aria-hidden="true" className="hero-galeria relative flex h-24 w-full max-w-md items-center justify-center sm:h-32">
      <HexImagen
        src={diapositiva.imagenIzquierda}
        alt=""
        carga="eager"
        sizes="(min-width: 640px) 150px, 100px"
        className="z-0 -mr-5 w-24 -rotate-6 drop-shadow-[0_16px_28px_rgb(0_0_0/0.35)] sm:-mr-7 sm:w-36"
      />
      <div className="relative z-10 grid size-16 shrink-0 place-items-center rounded-full border border-white/25 bg-carbon/75 p-2 shadow-[0_0_32px_rgb(224_36_36/0.3)] backdrop-blur-md sm:size-24 sm:p-3">
        <Espiral className="hero-emblema size-full" />
      </div>
      <HexImagen
        src={diapositiva.imagenDerecha}
        alt=""
        carga="eager"
        sizes="(min-width: 640px) 150px, 100px"
        className="z-0 -ml-5 w-24 rotate-6 drop-shadow-[0_16px_28px_rgb(0_0_0/0.35)] sm:-ml-7 sm:w-36"
      />
    </div>
  );
}

function WidgetDiapositiva({ diapositiva }: { diapositiva: Diapositiva }) {
  return (
    <div className="hero-widget mx-auto mt-3 w-full max-w-2xl rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-center shadow-lg backdrop-blur-md sm:mt-4 sm:px-6">
      <p className="font-display text-sm font-bold uppercase tracking-[0.12em] text-white/90 sm:text-base">{diapositiva.subtitulo}</p>
      <p className="mt-1 text-xs leading-relaxed text-white/75 sm:text-sm">{diapositiva.texto}</p>
    </div>
  );
}

export default function HeroSlider() {
  return (
    <section className="relative isolate min-h-svh overflow-hidden bg-[#111214]">
      <h1 className="sr-only">Fimav Perú — Especialistas en bienes y servicios</h1>
      <Carrusel
        etiqueta="Fimav Perú"
        auto={6000}
        fundido
        controlesFundido
        className="hero-carousel relative isolate mx-auto grid min-h-svh w-full max-w-none items-center px-4 pb-24 pt-28 sm:px-8 sm:pb-24 sm:pt-32 lg:px-16"
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
          </div>
        )}
        diapositivas={diapositivas.map((d) => (
          <div key={d.rojo} className="hero-slide-content mx-auto flex w-full max-w-5xl flex-col items-center px-1 py-1 text-center">
            <span className="hero-etiqueta mb-3 inline-flex items-center border border-white/30 bg-white/5 px-5 py-1.5 font-display text-xs font-bold tracking-[0.22em] text-white/90 backdrop-blur-sm sm:mb-4 sm:text-sm">
              FIMAV PERÚ
            </span>
            <SeccionTitulo
              nivel="h2"
              tam="lg"
              claroSobreOscuro
              alineacion="centro"
              claro={d.claro}
              rojo={d.rojo}
              className="hero-titulo w-full max-w-4xl [&_h2]:text-[clamp(2.25rem,6.5vw,5rem)] [&_h2]:tracking-[0.035em] [&_h2>span:first-child]:!text-white [&_h2>span:last-child]:!text-rojo"
            />
            <GaleriaDiapositiva diapositiva={d} />
            <WidgetDiapositiva diapositiva={d} />
            <div className="mt-4 flex w-full flex-wrap justify-center gap-3 sm:mt-5 sm:gap-4">
              {d.botones.map((b) => (
                <BotonHex key={b.texto} href={b.href} size="md" className="max-sm:flex-1 sm:!min-h-14 sm:!px-10 sm:!text-lg" icono={b.icono} variante={'contorno' in b ? 'contorno' : 'rojo'}>{b.texto}</BotonHex>
              ))}
            </div>
          </div>
        ))}
      />
      <a href="#sobre-nosotros" aria-label="Desplazarse a la siguiente sección" className="absolute bottom-4 left-1/2 z-20 grid size-11 -translate-x-1/2 place-items-center rounded-full text-white/75 transition duration-300 hover:translate-y-1 hover:text-white focus-visible:outline-white sm:bottom-5">
        <ChevronDown aria-hidden="true" size={28} />
        <span className="sr-only">Continuar a Sobre nosotros</span>
      </a>
    </section>
  );
}
