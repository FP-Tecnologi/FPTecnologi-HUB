import { BrandMarquee } from '@/components/site/BrandMarquee';
import { Contact } from '@/components/site/Contact';
import { Footer } from '@/components/site/Footer';
import { Hero9 } from '@/components/site9/Hero9';
import { Categories9 } from '@/components/site9/Categories9';
import { Services9 } from '@/components/site9/Services9';
import { Featured9 } from '@/components/site9/Featured9';
import { WhyChoose9 } from '@/components/site9/WhyChoose9';
import { COTIZADOR_URL } from '@/lib/content';

export const metadata = { title: 'Modelo 9' };

/*
 * Modelo 9 -- inspirado en la estructura/mecánica de un spec de referencia
 * de "RIVR" (dashboard DeFi): tarjeta hero a pantalla completa con foto de
 * fondo, nav de vidrio y 2 tarjetas flotantes (ver Hero9/Navbar9). El hero
 * original era de una sola sección; a pedido del usuario ("me gusta el
 * estilo del Modelo 9, rediseñemos las demás secciones") se suman acá el
 * resto de las secciones reales del sitio (Categorías, Servicios,
 * Productos destacados, Por qué elegirnos) con el mismo lenguaje visual:
 * fondo claro #f0f0f0/blanco, tarjetas de vidrio (blur + borde sutil),
 * acento navy rgba(30,50,90,X), sin cards oscuras -- eso es Modelo 7/8.
 */
export default function Modelo9Page() {
  return (
    <>
      <main>
        <Hero9 />
        <Categories9 />
        <Services9 />
        <Featured9 />
        <WhyChoose9 />

        <section className="bg-[rgba(30,50,90,0.95)] px-6 py-20 text-center text-white">
          <h2 className="mx-auto max-w-2xl text-2xl font-normal tracking-tight sm:text-3xl">
            Tecnología sin fricción para tu empresa
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/70">
            Stock local, distribución autorizada y cotización sin compromiso.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href="#catalogo" className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[rgba(30,50,90,0.95)] transition-colors hover:bg-white/90">
              Ver catálogo
            </a>
            <a href={COTIZADOR_URL} target="_blank" rel="noreferrer" className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10">
              Cotizar ahora
            </a>
          </div>
        </section>

        <BrandMarquee />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
