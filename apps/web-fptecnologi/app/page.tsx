import { BrandMarquee } from '@/components/home/BrandMarquee';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';
import { Hero } from '@/components/home/Hero';
import { Nosotros } from '@/components/home/Nosotros';
import { NuestrosClientes } from '@/components/home/NuestrosClientes';
import { NuestrosProyectos } from '@/components/home/NuestrosProyectos';
import { PartnerCta } from '@/components/home/PartnerCta';
import { ProductCategories } from '@/components/home/ProductCategories';
import { Solutions } from '@/components/home/Solutions';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';

/*
 * Home reconstruida desde cero sobre src/components/home/ (ver
 * docs/notas-rediseno-web-publica.md) -- carpeta autocontenida con los
 * componentes ya elegidos como definitivos (catalogados antes en
 * app/guia-estilos-final): Hero = Hero9 real (copiado de site9/, con video
 * de fondo y su propio Navbar9 -- ese nav ya reusa el DesktopNav/MobileNav
 * real del sitio, ver Navbar9.tsx), ServiceCardFinal, ProductCardFinal +
 * comparador + galería, y PartnerCta (Modelo Riteflow).
 *
 * Sin <TopBar/><Header/> separados: Hero9 trae su propio nav (Navbar9)
 * flotando sobre el video, igual que en /modelo-9. Pendiente (ver notas):
 * Navbar9 todavía no tiene carrito ni selector de moneda como el Header
 * real -- falta esa integración.
 *
 * Estructura pedida por el usuario (orden fijo, no el de estructura-home.md
 * anterior): Hero → Marcas → Nosotros (breve) → Servicios → Por qué
 * elegirnos → Categorías → Productos destacados → Nuestros proyectos →
 * Nuestros clientes → Partners → Contacto → Footer.
 *
 * Nosotros, Por qué elegirnos, Categorías de producto y Contacto siguen
 * siendo los componentes viejos de site/site2 (copiados tal cual, sin
 * rediseñar) -- placeholder hasta definir su versión final. Nuestros
 * proyectos y Nuestros clientes son secciones nuevas sin contenido real
 * todavía, marcadas TODO en sus propios archivos.
 */
export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <BrandMarquee showLabel={false} />
        <Nosotros />
        <Solutions />
        <WhyChooseUs />
        <ProductCategories />
        <FeaturedProducts />
        <NuestrosProyectos />
        <NuestrosClientes />
        <PartnerCta />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
