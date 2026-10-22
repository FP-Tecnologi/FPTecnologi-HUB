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
    foto: '/fotos/escritorios-2.jpg', alt: 'Computadoras de escritorio',
    botones: [{ href: '/cotizar', icono: FileText, texto: 'Solicitar cotización' }, { href: '/catalogo', icono: LayoutGrid, texto: 'Ver catálogo', contorno: true }],
  },
  {
    claro: 'Tecnología para el Estado', rojo: 'y las empresas',
    texto: 'Desarrollamos soluciones tecnológicas según la necesidad de cada entidad, con equipos de las marcas más comerciales del mercado.',
    foto: '/fotos/servidores-1.jpg', alt: 'Servidores',
    botones: [{ href: '/catalogo', icono: LayoutGrid, texto: 'Ver catálogo' }],
  },
  {
    claro: 'Estamos en', rojo: 'Perú Compras',
    texto: 'Venta de bienes y servicios y postventa B2G, con presencia en Lima Metropolitana y los demás departamentos del país.',
    foto: '/peru-compras/contenedor.jpg', alt: 'Contenedor de Perú Compras',
    botones: [{ href: '/peru-compras', icono: Landmark, texto: 'Conoce más' }, { href: '/cotizar', icono: FileText, texto: 'Cotizar', contorno: true }],
  },
  {
    claro: 'Impresión, redes', rojo: 'y más',
    texto: 'Impresión, networking, aire acondicionado, baterías, consumibles, mobiliario y papel para tu organización.',
    foto: '/fotos/impresoras-2.jpg', alt: 'Impresora multifuncional',
    botones: [{ href: '/catalogo', icono: ArrowRight, texto: 'Explorar categorías' }],
  },
];

export default function HeroSlider() {
  return (
    <section className="relative overflow-hidden bg-white">
      <Espiral contorno className="pointer-events-none absolute -bottom-32 -left-28 w-56 opacity-40 sm:-bottom-24 sm:-left-24 sm:opacity-60" />
      <h1 className="sr-only">Fimav Perú — Especialistas en bienes y servicios</h1>
      <Carrusel
        etiqueta="Fimav Perú"
        auto={6000}
        className="relative mx-auto max-w-6xl px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-8 lg:pb-10 lg:pt-14"
        diapositivas={diapositivas.map((d, i) => (
          <div key={d.rojo} className="grid items-center gap-3 px-1 py-1 sm:gap-6 lg:min-h-[480px] lg:grid-cols-[1.05fr_1fr] lg:gap-4">
            {/* Imagen central única: espiral con la foto en el hueco; arriba del texto en móvil. */}
            <div className="relative mx-auto aspect-square w-full max-w-[150px] sm:max-w-[340px] lg:order-2 lg:max-w-[460px]">
              <Espiral className="absolute inset-[6%] size-[88%] animate-[giro_60s_linear_infinite] [[inert]_&]:animate-none [[data-rep='false']_&]:animate-none" />
              <div className="absolute left-[33.5%] top-[31.85%] w-[33%]">
                <HexImagen src={d.foto} alt={d.alt} carga={i === 0 ? 'eager' : 'lazy'} prioridad={i === 0} sizes="180px" />
              </div>
            </div>
            <div className="lg:order-1">
              <SeccionTitulo nivel="h2" tam="lg" claro={d.claro} rojo={d.rojo} className="max-w-xl" />
              <p className="mt-3 max-w-md text-carbon/80 sm:mt-5 sm:text-lg">{d.texto}</p>
              <div className="mt-4 flex flex-wrap gap-2 sm:mt-7 sm:gap-4">
                {d.botones.map((b) => (
                  <BotonHex key={b.texto} href={b.href} size="sm" className="max-sm:flex-1 sm:!min-h-13 sm:!px-10 sm:!text-lg" icono={b.icono} variante={'contorno' in b ? 'contorno' : 'rojo'}>{b.texto}</BotonHex>
                ))}
              </div>
            </div>
          </div>
        ))}
      />
    </section>
  );
}
