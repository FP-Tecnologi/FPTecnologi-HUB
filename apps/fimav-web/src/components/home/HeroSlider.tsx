'use client';

import { ArrowRight, FileText, Landmark, LayoutGrid } from 'lucide-react';
import SeccionTitulo from '@/components/SeccionTitulo';
import Espiral from '@/components/Espiral';
import BotonHex from '@/components/hex/BotonHex';
import HexImagen from '@/components/hex/HexImagen';
import Carrusel from '@/components/slider/Carrusel';

// Solo lo que consta en el brochure.
const diapositivas = [
  {
    claro: 'Especialistas en', rojo: 'bienes y servicios',
    texto: 'Organización comercial especializada en el sector Corporativo y Gobierno, con el respaldo de las marcas más representativas del segmento tecnológico.',
    fotos: [{ src: '/fotos/escritorios-2.jpg', alt: 'Notebook' }, { src: '/fotos/all-in-one-1.jpg', alt: 'Monitor' }],
    botones: [{ href: '/cotizar', icono: FileText, texto: 'Solicitar cotización' }, { href: '/catalogo', icono: LayoutGrid, texto: 'Ver catálogo', contorno: true }],
  },
  {
    claro: 'Tecnología para el Estado', rojo: 'y las empresas',
    texto: 'Desarrollamos soluciones tecnológicas según la necesidad de cada entidad, con equipos de las marcas más comerciales del mercado.',
    fotos: [{ src: '/fotos/servidores-1.jpg', alt: 'Servidores' }, { src: '/fotos/networking-1.jpg', alt: 'Cableado de red' }],
    botones: [{ href: '/catalogo', icono: LayoutGrid, texto: 'Ver catálogo' }],
  },
  {
    claro: 'Estamos en', rojo: 'Perú Compras',
    texto: 'Venta de bienes y servicios y postventa B2G, con presencia en Lima Metropolitana y los demás departamentos del país.',
    fotos: [{ src: '/peru-compras/contenedor.jpg', alt: 'Contenedor de Perú Compras' }, { src: '/fotos/monitores-1.jpg', alt: 'Monitor' }],
    botones: [{ href: '/peru-compras', icono: Landmark, texto: 'Conoce más' }, { href: '/cotizar', icono: FileText, texto: 'Cotizar', contorno: true }],
  },
  {
    claro: 'Impresión, redes', rojo: 'y más',
    texto: 'Impresión, networking, aire acondicionado, baterías, consumibles, mobiliario y papel para tu organización.',
    fotos: [{ src: '/fotos/impresoras-2.jpg', alt: 'Impresora multifuncional' }, { src: '/fotos/consumibles-1.jpg', alt: 'Tóner' }],
    botones: [{ href: '/catalogo', icono: ArrowRight, texto: 'Explorar categorías' }],
  },
];

// Dos fotos flotantes a los lados de la espiral; cada diapositiva trae su par y se funden con ella.
const POS = [
  'left-[-3%] top-[2%] w-[34%] sm:w-[31%]',
  'bottom-[0%] right-[-2%] w-[36%] sm:w-[33%]',
];

const FUNDIDO = (activo: boolean) => `transition-opacity ease-out ${activo ? 'opacity-100 duration-500 delay-300' : 'opacity-0 duration-300'}`;

export default function HeroSlider() {
  return (
    <section className="relative overflow-hidden bg-white">
      <Espiral contorno className="pointer-events-none absolute -bottom-32 -left-28 w-56 opacity-40 sm:-bottom-24 sm:-left-24 sm:opacity-60" />
      <h1 className="sr-only">Fimav Perú — Especialistas en bienes y servicios</h1>
      <Carrusel
        etiqueta="Fimav Perú"
        auto={6000}
        fundido
        className="relative mx-auto grid max-w-6xl items-center gap-3 px-4 pb-6 pt-4 sm:gap-6 sm:px-6 sm:pb-8 sm:pt-8 lg:min-h-[480px] lg:grid-cols-[1.05fr_1fr] lg:gap-4 lg:pb-10 lg:pt-14"
        /* Visual único dentro del carrusel (hover/foco pausan): la espiral gira sin parar, nada la reinicia, y no lleva foto en el centro. */
        visual={(activa) => (
          <div className="relative mx-auto aspect-square w-full max-w-[220px] sm:max-w-[340px] lg:order-2 lg:max-w-[460px]">
            <Espiral className="absolute inset-[6%] size-[88%] animate-[giro_60s_linear_infinite]" />
            {diapositivas.map((d, i) => (
              <div key={d.rojo} aria-hidden={i === activa ? undefined : true} className={`absolute inset-0 ${FUNDIDO(i === activa)}`}>
                {d.fotos.map((f, j) => (
                  <div key={f.src} className={`absolute ${POS[j]}`}>
                    <div className={i === activa ? `drop-shadow-[0_14px_22px_rgb(56_56_60/0.22)] ${j ? 'animate-[flotar_8.5s_ease-in-out_infinite]' : 'animate-[flotar_7s_ease-in-out_infinite]'}` : ''}>
                      <HexImagen src={f.src} alt={i === activa ? f.alt : ''} carga={i === 0 ? 'eager' : 'lazy'} prioridad={i === 0} sizes="180px" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        diapositivas={diapositivas.map((d) => (
          <div key={d.rojo} className="px-1 py-1">
            <SeccionTitulo nivel="h2" tam="lg" claro={d.claro} rojo={d.rojo} className="max-w-xl" />
            <p className="mt-3 max-w-md text-carbon/80 sm:mt-5 sm:text-lg">{d.texto}</p>
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-7 sm:gap-4">
              {d.botones.map((b) => (
                <BotonHex key={b.texto} href={b.href} size="sm" className="max-sm:flex-1 sm:!min-h-13 sm:!px-10 sm:!text-lg" icono={b.icono} variante={'contorno' in b ? 'contorno' : 'rojo'}>{b.texto}</BotonHex>
              ))}
            </div>
          </div>
        ))}
      />
    </section>
  );
}
