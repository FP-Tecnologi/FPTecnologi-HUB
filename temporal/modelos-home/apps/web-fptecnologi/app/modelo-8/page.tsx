import { BrandMarquee } from '@/components/site/BrandMarquee';
import { Contact } from '@/components/site/Contact';
import { Footer } from '@/components/site/Footer';
import { Header8 } from '@/components/site8/Header8';
import { Hero8 } from '@/components/site8/Hero8';
import { Stats8 } from '@/components/site8/Stats8';
import { Categories8 } from '@/components/site8/Categories8';
import { Services8 } from '@/components/site8/Services8';
import { Featured8 } from '@/components/site8/Featured8';
import { WhyChoose8 } from '@/components/site8/WhyChoose8';
import { COTIZADOR_URL } from '@/lib/content';

export const metadata = { title: 'Modelo 8' };

/*
 * Modelo 8 -- inspirado en la estructura/mecánica de un spec de referencia
 * de "Vesper.ai" (SaaS de IA): negro, nav en pastillas de metal líquido,
 * CTAs de vidrio, reveal enmascarado en el titular (ver Header8/Hero8/
 * Stats8). El hero original era de una sola pantalla; a pedido del usuario
 * ("me gusta el estilo, hagamos el resto de las secciones") se suma acá el
 * resto de la home real (Categorías, Servicios, Productos destacados, Por
 * qué elegirnos) con el mismo lenguaje visual: negro/gris metálico, bordes
 * plateados sutiles, sin color de marca -- eso es Modelo 7/9.
 */
export default function Modelo8Page() {
  return (
    <div className="bg-black text-white">
      <div
        className="relative overflow-hidden"
        style={{
          background:
            'radial-gradient(560px circle at 50% 20%, rgba(255,255,255,0.07), transparent 60%),'
            + 'radial-gradient(ellipse 120% 70% at 50% 0%, #1a1a1a 0%, #000000 60%)',
        }}
      >
        {/* Grano sutil (SVG feTurbulence, sin asset) -- el negro liso de
            antes quedaba muy plano/vacío arriba del badge. Mismo espíritu
            que el ".grain" del spec original de Vesper.ai, sin librería. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <Header8 />
        <Hero8 />
        <Stats8 />
      </div>

      <Categories8 />
      <Services8 />
      <Featured8 />
      <WhyChoose8 />

      <section
        className="border-t border-white/10 px-6 py-20 text-center"
        style={{ background: 'radial-gradient(ellipse 120% 100% at 50% 100%, #1a1a1a 0%, #000000 60%)' }}
      >
        <h2 className="mx-auto max-w-2xl text-2xl font-medium tracking-[-0.03em] text-white sm:text-3xl">
          Equipamiento TI con stock local real.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/50">
          Distribución autorizada, cotización sin compromiso y un especialista que arma la propuesta a tu medida.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#catalogo"
            className="flex h-[42px] items-center rounded-md border border-white bg-[linear-gradient(180deg,#ffffff_0%,#e7e7e7_48%,#cfcfcf_100%)] px-6 text-sm font-medium text-[#111] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] transition-shadow duration-300 hover:shadow-[inset_0_1px_0_#fff,0_0_26px_rgba(186,208,255,0.4),0_8px_18px_rgba(255,255,255,0.14)]"
          >
            Ver catálogo
          </a>
          <a
            href={COTIZADOR_URL}
            target="_blank"
            rel="noreferrer"
            className="flex h-[42px] items-center rounded-md border border-white/55 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(0,0,0,0.5)_46%,rgba(150,170,200,0.1))] px-6 text-sm font-medium text-white backdrop-blur-md transition-shadow duration-300 hover:border-white/80 hover:shadow-[0_0_24px_rgba(170,200,255,0.28)]"
          >
            Cotizar ahora
          </a>
        </div>
      </section>

      <BrandMarquee />
      <Contact />
      <Footer />
    </div>
  );
}
