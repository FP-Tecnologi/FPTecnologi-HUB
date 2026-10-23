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
    claro: 'Especialistas en', rojo: 'bienes y servicios',
    subtitulo: 'Tecnología para cada espacio de trabajo',
    texto: 'Organización comercial especializada en el sector Corporativo y Gobierno, con el respaldo de las marcas más representativas del segmento tecnológico.',
    imagenLateral: '/fotos/all-in-one-1.jpg', detalle: 'Equipos de cómputo para organizaciones',
    fondo: '/fotos/escritorios-2.jpg',
    botones: [{ href: '/cotizar', icono: FileText, texto: 'Solicitar cotización' }, { href: '/catalogo', icono: LayoutGrid, texto: 'Ver catálogo', contorno: true }],
  },
  {
    claro: 'Tecnología para el Estado', rojo: 'y las empresas',
    subtitulo: 'Infraestructura que conecta y sostiene tu operación',
    texto: 'Desarrollamos soluciones tecnológicas según la necesidad de cada entidad, con equipos de las marcas más comerciales del mercado.',
    imagenLateral: '/fotos/networking-1.jpg', detalle: 'Servidores y conectividad',
    fondo: '/fotos/servidores-1.jpg',
    botones: [{ href: '/catalogo', icono: LayoutGrid, texto: 'Ver catálogo' }],
  },
  {
    claro: 'Estamos en', rojo: 'Perú Compras',
    subtitulo: 'Soluciones para entidades del sector público',
    texto: 'Venta de bienes y servicios y postventa B2G, con presencia en Lima Metropolitana y los demás departamentos del país.',
    imagenLateral: '/fotos/proyectores-1.jpg', detalle: 'Atención B2G en todo el Perú',
    fondo: '/peru-compras/contenedor.jpg',
    botones: [{ href: '/peru-compras', icono: Landmark, texto: 'Conoce más' }, { href: '/cotizar', icono: FileText, texto: 'Cotizar', contorno: true }],
  },
  {
    claro: 'Impresión, redes', rojo: 'y más',
    subtitulo: 'Equipamiento para las necesidades de tu organización',
    texto: 'Impresión, networking, aire acondicionado, baterías, consumibles, mobiliario y papel para tu organización.',
    imagenLateral: '/fotos/consumibles-1.jpg', detalle: 'Impresión, redes y suministros',
    fondo: '/fotos/impresoras-2.jpg',
    botones: [{ href: '/catalogo', icono: ArrowRight, texto: 'Explorar categorías' }],
  },
];

type Diapositiva = (typeof diapositivas)[number];

function WidgetDiapositiva({ diapositiva, compacto = false }: { diapositiva: Diapositiva; compacto?: boolean }) {
  return (
    <div aria-hidden="true" className={compacto ? 'flex items-center gap-4 lg:hidden' : 'absolute right-[8%] top-1/2 hidden w-[min(34vw,440px)] -translate-y-1/2 lg:block'}>
      <div className={compacto ? 'relative w-20 shrink-0 sm:w-24' : 'relative mx-auto w-[82%]'}>
        <HexImagen
          src={diapositiva.imagenLateral}
          alt=""
          carga={compacto ? 'lazy' : 'eager'}
          sizes={compacto ? '96px' : '(min-width: 1024px) 380px, 34vw'}
          className={compacto ? 'w-full' : 'w-full drop-shadow-[0_18px_32px_rgb(0_0_0/0.35)]'}
        />
        <div className={`absolute z-10 grid place-items-center rounded-full border border-white/20 bg-carbon/80 p-2 shadow-lg backdrop-blur-sm ${compacto ? '-left-2 -top-2 size-10' : '-left-5 top-[14%] size-16'}`}>
          <Espiral className="hero-emblema size-full" />
        </div>
      </div>
      <p className={compacto ? 'max-w-56 text-xs font-semibold uppercase tracking-wider text-white/80 sm:text-sm' : 'mx-auto mt-5 w-fit max-w-[80%] border-l-2 border-rojo bg-black/25 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm'}>
        {diapositiva.detalle}
      </p>
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
        className="relative isolate mx-auto grid min-h-svh w-full max-w-none items-center px-4 pb-24 pt-28 sm:px-8 sm:pb-24 sm:pt-32 lg:px-16"
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
            <WidgetDiapositiva diapositiva={diapositivas[activa]} />
          </div>
        )}
        diapositivas={diapositivas.map((d) => (
          <div key={d.rojo} className="px-1 py-1 lg:max-w-[58%]">
            <SeccionTitulo nivel="h2" tam="lg" claroSobreOscuro claro={d.claro} rojo={d.rojo} className="max-w-3xl [&_h2]:text-[clamp(2.75rem,7vw,5.5rem)] [&_h2]:tracking-[0.035em] [&_h2>span:first-child]:!text-white [&_h2>span:last-child]:!text-rojo" />
            <p className="mt-4 max-w-xl font-display text-xl font-bold leading-snug text-white sm:mt-6 sm:text-2xl">{d.subtitulo}</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">{d.texto}</p>
            <WidgetDiapositiva diapositiva={d} compacto />
            <div className="mt-5 flex flex-wrap gap-3 sm:mt-7 sm:gap-4">
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
