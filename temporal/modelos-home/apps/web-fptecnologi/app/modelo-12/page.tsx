import React from 'react';
import AboutSection from '@riteflow/components/home-v2/AboutSection';
import HomeBannerOne from '@riteflow/components/home-v1/HomeBannerOne';
import ClientLogosOne from '@riteflow/components/home-v1/ClientLogosOne';
import ProcessSection from '@riteflow/components/home-v1/ProcessSection';
import WorkflowSection from '@riteflow/components/home-v1/WorkflowSection';
import TestimonialOne from '@riteflow/components/home-v1/TestimonialOne';
import { PARTNER_BRANDS, WHY_CHOOSE_US } from '@/lib/content';
import { ServicesSection } from './ServicesSection';
import { ProductsSection } from './ProductsSection';
import { ContactSection } from './ContactSection';

export const metadata = { title: 'Modelo 12' };

/*
 * Modelo 12 -- primer paso de dos, pedido por el usuario: tomar la
 * estructura de /preview/riteflow-home-v1 (misma plantilla original, mismos
 * componentes, mismo orden de secciones -- "esa estructura también está
 * buena") y pasarla de oscura a blanca, manteniendo los gráficos
 * decorativos (líneas onduladas de WorkflowSection, ícono de apps, glow de
 * Newsletter -- ver riteflow-light.css). Todavía es contenido/copy de la
 * plantilla en inglés: cambiar la información a la real de FPTecnologi
 * ("cambiaremos sección por sección") es el segundo paso, pendiente.
 *
 * Único cambio de contenido en este paso: el fondo del Hero (banner-bg.webp)
 * es una imagen oscura rectangular pensada para ese tema -- no hay forma de
 * que "se ponga blanca" con CSS porque es una foto, así que se reemplaza por
 * un glow del propio set de assets del template que ya es claro
 * (newsletter-top-glow-shape.png), no una imagen nueva.
 */
function ServicesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.4-3.4a5 5 0 0 1-6.4 6.4L6.7 20.3a2 2 0 0 1-2.8-2.8l8-8a5 5 0 0 1 6.4-6.4l-3.4 3.4-.2-.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M3 9.5 4.5 4h15L21 9.5M3 9.5v9a1.5 1.5 0 0 0 1.5 1.5h15A1.5 1.5 0 0 0 21 18.5v-9M3 9.5h18M9 21v-4.5a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5V21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Reseñas reales de Google todavía no conectadas (ver docs/estructura-home.md)
   -- en vez de nombres/frases inventadas, se usa un avatar genérico y un
   texto que dice exactamente eso, para no simular reseñas de gente que no
   existe mientras se arma la integración real. */
const PLACEHOLDER_TESTIMONIALS = [
  {
    name: 'Nombre del cliente',
    role: 'Cargo / empresa',
    image: '/images/modelo12/avatar-placeholder.svg',
    text: 'Acá va a aparecer una reseña real, verificada en Google -- todavía no está conectada la integración.',
  },
  {
    name: 'Nombre del cliente',
    role: 'Cargo / empresa',
    image: '/images/modelo12/avatar-placeholder.svg',
    text: 'Acá va a aparecer una reseña real, verificada en Google -- todavía no está conectada la integración.',
  },
  {
    name: 'Nombre del cliente',
    role: 'Cargo / empresa',
    image: '/images/modelo12/avatar-placeholder.svg',
    text: 'Acá va a aparecer una reseña real, verificada en Google -- todavía no está conectada la integración.',
  },
];

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-9v4.5m0-7.5h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Modelo12Page() {
  return (
    <>
      <HomeBannerOne
        backgroundImage="/images/newsletter-top-glow-shape.png"
        badgeText="FPTECNOLOGI"
        title="Soluciones tecnológicas para"
        titleHighlight="tu empresa"
        description="Equipamiento con stock local y servicios TI implementados por especialistas — seguridad, videoconferencia, cloud y data centers, a medida de tu operación."
        buttonText="Ver servicios"
        buttonLink="/servicios"
        buttonIcon={<ServicesIcon />}
        secondaryButtonText="Ver tienda"
        secondaryButtonLink="/tienda"
        secondaryButtonIcon={<StoreIcon />}
        dashboardImage="/images/modelo12/hero-it-solutions-v2.jpg"
        dashboardImageAlt="Soluciones TI FPTecnologi — comunicación, dispositivos y conectividad para empresas"
      />
      <ClientLogosOne
        title="Distribución autorizada de las principales marcas"
        logos={PARTNER_BRANDS.map((b) => ({ src: b.logo, alt: b.name }))}
      />
      <AboutSection
        variant="one"
        badgeText="Sobre nosotros"
        title="Equipamiento TI con distribución autorizada"
        description="FP Tecnologi & System es distribuidor autorizado de equipamiento TI en Lima, Perú, con stock local de más de 13 marcas y dos líneas de negocio: tienda B2B con despacho inmediato y servicios TI a medida, cotizados sin compromiso."
        videoSrc="/images/home/about.mp4"
        listItems={[
          'Stock local, sin depender de importación por pedido.',
          'Distribución autorizada, con garantía oficial de cada marca.',
        ]}
        buttonText="Más información"
        buttonLink="/nosotros"
        buttonIcon={<InfoIcon />}
        checkIconSrc="/images/modelo12/list-check-blue.svg"
      />
      <ServicesSection />
      <ProcessSection
        title="Por qué elegirnos"
        description="Distribución autorizada, stock real y un equipo comercial que arma la propuesta a tu medida."
        steps={WHY_CHOOSE_US.map((item, i) => ({
          step: i + 1,
          title: item.title,
          description: item.text,
        }))}
        stepLabel="Motivo"
      />
      <ProductsSection />
      <WorkflowSection
        title="Sumate como integrador o revendedor"
        description="Precios y beneficios especiales para partners, con soporte comercial dedicado y cotización directa."
        buttonText="Sumarme como partner"
        buttonLink="/nosotros"
      />
      <TestimonialOne
        badgeText="Opiniones"
        title="Lo que dicen quienes ya trabajaron con nosotros"
        description="Reseñas reales de Google, verificadas -- se van a conectar acá apenas tengamos la integración lista. Mientras tanto, así se va a ver la sección."
        columnOneTestimonials={PLACEHOLDER_TESTIMONIALS}
        columnTwoTestimonials={PLACEHOLDER_TESTIMONIALS}
        columnThreeTestimonials={PLACEHOLDER_TESTIMONIALS}
        emptyStateHref="https://www.google.com/maps?q=FP+Tecnologi+%26+System,+Jr.+Huaraz+1841,+Bre%C3%B1a,+Lima"
      />
      <ContactSection />
    </>
  );
}
