import '../../src/_riteflow-original/styles/globals.css';
import './riteflow-light.css';
import Footer from '@riteflow/components/Layouts/Footer';
import { Header } from '@/components/site/Header';
import { TopBar } from '@/components/site/TopBar';

/*
 * Layout SOLO para /modelo-12 -- ver riteflow-light.css para el detalle del
 * cambio de tokens oscuro -> blanco. Header propio (no el de Riteflow):
 * el usuario pidió "encabezado bonito, en español, según nuestros
 * encabezados de modelos" -- el original traía nav en inglés
 * (Home/About/Features/Pricing/All Pages) sin relación con la estructura
 * real del sitio. TopBar+Header son los mismos componentes reales que usa
 * el Modelo 1 (site/Header.tsx): Inicio/Servicios/Tienda/Marcas/Nosotros/
 * Contacto, cotizador y carrito reales -- ya en español, ya con la
 * paleta de marca (vienen de app/globals.css, no de los tokens de Riteflow).
 * El footer se deja el de Riteflow por ahora (mismo criterio de "sección
 * por sección" -- todavía en inglés/marca Riteflow, pendiente igual que el
 * resto del copy).
 */
export default function Modelo12Layout({ children }: { children: React.ReactNode }) {
  // El body real (bg-secondary, oscuro) sigue detrás -- se lo tapa con este
  // div blanco explícito en vez de depender de un selector `body` que no le
  // gana la cascada al layout raíz (mismo bug ya resuelto en app/preview).
  return (
    <div className="riteflow-light bg-white text-[#12172a]">
      <TopBar />
      <Header />
      {children}
      <Footer />
    </div>
  );
}
