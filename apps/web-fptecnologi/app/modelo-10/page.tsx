import Image from 'next/image';
import { BrandMarquee } from '@/components/site/BrandMarquee';
import { Contact } from '@/components/site/Contact';
import { Footer } from '@/components/site/Footer';
import { Header10 } from '@/components/site10/Header10';
import { Hero10 } from '@/components/site10/Hero10';
import { Favorites10 } from '@/components/site10/Favorites10';
import { SplitBanner10 } from '@/components/site10/SplitBanner10';
import { TrustStats10 } from '@/components/site10/TrustStats10';
import { About10 } from '@/components/site10/About10';
import { Steps10 } from '@/components/site10/Steps10';
import { FAQ10 } from '@/components/site10/FAQ10';
import { COTIZADOR_URL } from '@/lib/content';

export const metadata = { title: 'Modelo 10' };

/*
 * Modelo 10 -- inspirado en la estructura de una landing de e-commerce
 * premium (relojería: hero con foto oscura, favoritos del mes numerados,
 * banner partido en 2, historias de clientes, sobre nosotros, pasos,
 * FAQ, CTA final). Contenido 100% FPTecnologi:
 * - Las "historias de coleccionistas" con foto+nombre+cita se reemplazan
 *   por TrustStats10 (métricas reales de STATS) -- no hay testimonios de
 *   clientes reales relevados todavía, así que no se inventan personas ni
 *   citas (mismo criterio ya establecido en WHY_CHOOSE_US/content.ts).
 * - El banner partido "para él / para ella" se reemplaza por las 2 líneas
 *   de negocio reales (BUSINESS_PATHS: Tienda B2B / Servicios TI).
 * - "Añadir al carrito" es el carrito real del sitio (CartContext), no
 *   decorativo.
 */
export default function Modelo10Page() {
  return (
    <>
      <Header10 />
      <main>
        <Hero10 />
        <BrandMarquee />
        <Favorites10 />
        <SplitBanner10 />
        <TrustStats10 />
        <About10 />
        <Steps10 />
        <FAQ10 />

        <section className="relative overflow-hidden bg-ink px-6 py-24 text-center text-white">
          <Image src="/images/modelo7/hero.jpg" alt="" fill sizes="100vw" className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-ink/70" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Empezá la transformación tecnológica de tu empresa
            </h2>
            <p className="mt-3 text-white/70">Stock local, distribución autorizada y cotización sin compromiso.</p>
            <a href={COTIZADOR_URL} target="_blank" rel="noreferrer" className="btn-sweep mt-7 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink before:bg-brand-primary hover:text-white">
              Cotizar ahora
            </a>
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </>
  );
}
