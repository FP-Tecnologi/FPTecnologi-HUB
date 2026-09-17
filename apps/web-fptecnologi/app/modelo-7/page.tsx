import { BrandMarquee } from '@/components/site/BrandMarquee';
import { Contact } from '@/components/site/Contact';
import { Footer } from '@/components/site/Footer';
import { Header3 } from '@/components/site3/Header3';
import { FeaturedProducts } from '@/components/site2/FeaturedProducts';
import { Hero7 } from '@/components/site7/Hero7';
import { Categories7 } from '@/components/site7/Categories7';
import { Performance7 } from '@/components/site7/Performance7';
import { Connectivity7 } from '@/components/site7/Connectivity7';
import { WhyChoose7 } from '@/components/site7/WhyChoose7';
import { COTIZADOR_URL } from '@/lib/content';

export const metadata = { title: 'Modelo 7' };

export default function Modelo7Page() {
  return (
    <>
      <Header3 />
      <main>
        <Hero7 />
        <Categories7 />
        <FeaturedProducts />
        <Performance7 />
        <Connectivity7 />
        <WhyChoose7 />

        <section className="brand-mesh px-6 py-16 text-center text-white">
          <h2 className="mx-auto max-w-2xl font-display text-2xl font-bold sm:text-3xl">
            Tecnología sin límites para tu empresa
          </h2>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <a href="#categorias" className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-dark transition-colors hover:bg-white/90">
              Ver catálogo
            </a>
            <a href={COTIZADOR_URL} target="_blank" rel="noreferrer" className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              Hablar con un asesor
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
