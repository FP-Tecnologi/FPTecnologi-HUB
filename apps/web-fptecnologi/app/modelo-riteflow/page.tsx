import { Contact } from '@/components/site/Contact';
import { HeaderRiteflow } from '@/components/riteflow/HeaderRiteflow';
import { HeroRiteflow } from '@/components/riteflow/HeroRiteflow';
import { ClientLogosRiteflow } from '@/components/riteflow/ClientLogosRiteflow';
import { AboutRiteflow } from '@/components/riteflow/AboutRiteflow';
import { FeaturesRiteflow } from '@/components/riteflow/FeaturesRiteflow';
import { FooterRiteflow } from '@/components/riteflow/FooterRiteflow';

export const metadata = { title: 'Modelo Riteflow' };

/*
 * Modelo Riteflow -- a diferencia de los modelos 1-11 (inspirados solo en
 * capturas/specs de texto), este parte del código REAL de una plantilla
 * Next.js del usuario ("Riteflow", home-v2), en
 * C:\...\Downloads\riteflow-.../Next.Js\Riteflow-1.0.0\src\components\home-v2.
 * Se portaron los componentes tal cual su lógica (animaciones GSAP con
 * ScrollTrigger, conteo animado de estadísticas con IntersectionObserver),
 * cambiando SOLO:
 * - Contenido: copy/cifras 100% FPTecnologi (STATS, WHY_CHOOSE_US,
 *   PARTNER_BRANDS de content.ts) -- nada de "RiteFlow", "AI Tools",
 *   revenue/growth o reseñas inventadas del original.
 * - Video de fondo del hero y del "about" -> fotos reales ya licenciadas
 *   (Modelo 7/9) -- no son screenshots de un producto de IA que no existe.
 * - Sin las dependencias del template que no hacían falta para estas
 *   secciones (lucide-react, motion, swiper, lenis, class-variance-
 *   authority, clsx, tailwind-merge): los botones/íconos se rehicieron con
 *   Tailwind + SVG inline, como el resto de este proyecto. Solo se instaló
 *   `gsap`, que sí es necesario para las animaciones reales del template.
 * - Header/Footer propios (el mega-menú original es de todo el sitio
 *   Riteflow, no de esta home puntual -- portarlo entero es un modelo aparte).
 *
 * Del home-v2 original (10 secciones) se dejan afuera a propósito:
 * TestimonialSection (testimonios inventados -- ver criterio ya usado en
 * WHY_CHOOSE_US/content.ts), PricingSection (planes SaaS fijos, no aplica a
 * un negocio de cotización B2B), IntegrationSection (integraciones de
 * automatización con IA específicas del producto original), ComparisonTable
 * (comparación "nosotros vs. competencia" sin datos reales) y Newsletter
 * (no hay backend de captura de correo).
 */
export default function ModeloRiteflowPage() {
  return (
    <div id="inicio">
      <HeaderRiteflow />
      <HeroRiteflow />
      <ClientLogosRiteflow />
      <AboutRiteflow />
      <FeaturesRiteflow />
      <Contact />
      <FooterRiteflow />
    </div>
  );
}
