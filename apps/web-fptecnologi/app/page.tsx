import { BrandMarquee } from '@/components/site/BrandMarquee';
import { Contact } from '@/components/site/Contact';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { Nosotros } from '@/components/site/Nosotros';
import { PartnerSteps } from '@/components/site/PartnerSteps';
import { ProductCategories } from '@/components/site/ProductCategories';
import { Solutions } from '@/components/site/Solutions';
import { TopBar } from '@/components/site/TopBar';
import { FeaturedProducts } from '@/components/site2/FeaturedProducts';
import { WhyChooseUs } from '@/components/site2/WhyChooseUs';

/*
 * Estructura final acordada (ver docs/estructura-home.md): Hero de 3 →
 * Marcas → Nosotros → Servicios (8) → Por qué elegirnos → Categorías de
 * productos → Productos destacados (carrito + comparar) → Sé partner →
 * Contacto (con formulario liviano) → Footer. Mismo orden que /modelo-riteflow,
 * con el estilo propio del Modelo 1 en vez del de Riteflow.
 */
export default function HomePage() {
  return (
    <>
      <TopBar />
      <Header />
      <main>
        <Hero />
        <BrandMarquee />
        <Nosotros />
        <Solutions />
        <WhyChooseUs />
        <ProductCategories />
        <FeaturedProducts />
        <PartnerSteps />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
