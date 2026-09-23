import { BrandMarquee } from '@/components/site-claude/BrandMarquee';
import { Contact } from '@/components/site-claude/Contact';
import { Footer } from '@/components/site-claude/Footer';
import { Header } from '@/components/site-claude/Header';
import { Hero } from '@/components/site-claude/Hero';
import { Nosotros } from '@/components/site-claude/Nosotros';
import { PartnerSteps } from '@/components/site-claude/PartnerSteps';
import { ProductCategories } from '@/components/site-claude/ProductCategories';
import { Solutions } from '@/components/site-claude/Solutions';
import { TopBar } from '@/components/site-claude/TopBar';
import { FeaturedProducts } from '@/components/site-claude/FeaturedProducts';
import { WhyChooseUs } from '@/components/site-claude/WhyChooseUs';

export const metadata = { title: 'Modelo Claude (snapshot)' };

/*
 * Snapshot congelado de la home real (`/`, app/page.tsx) tomado el
 * 2026-09-22, a pedido del usuario: la raíz sigue siendo donde se arma la
 * versión final (mezclando piezas de distintos modelos sobre la base de
 * Modelo 1 -- ver docs/notas-rediseno-web-publica.md), así que esta ruta
 * existe para poder comparar "cómo estaba" en este punto sin depender de
 * los componentes compartidos de site/ y site2/, que van a seguir
 * cambiando. Usa su propia copia de componentes en
 * src/components/site-claude/ -- NO se actualiza automáticamente si
 * Hero.tsx, Solutions.tsx, etc. cambian después. Si se necesita otro
 * snapshot más adelante, repetir la copia con una fecha/nombre distinto en
 * vez de sobreescribir este.
 */
export default function ModeloClaudePage() {
  return (
    <>
      <TopBar />
      <Header />
      <main>
        <Hero />
        <BrandMarquee showLabel={false} />
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
