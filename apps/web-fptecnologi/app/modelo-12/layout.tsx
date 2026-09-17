import '../../src/_riteflow-original/styles/globals.css';
import './riteflow-light.css';
import { Header } from '@/components/site/Header';
import { TopBar } from '@/components/site/TopBar';
import { FooterSection } from './FooterSection';

/*
 * Layout SOLO para /modelo-12 -- ver riteflow-light.css para el detalle del
 * cambio de tokens oscuro -> blanco. Header y footer propios (no los de
 * Riteflow): el original traía nav/pie en inglés y marca Riteflow (logo
 * "Riteflow" gigante al pie), sin relación con la estructura real del
 * sitio. TopBar+Header son los mismos componentes reales que usa el
 * Modelo 1 (site/Header.tsx): Inicio/Servicios/Tienda/Marcas/Nosotros/
 * Contacto, cotizador y carrito reales. FooterSection es propio de este
 * modelo (ver FooterSection.tsx) -- azul oscuro de marca, logo real de
 * FPTecnologi a todo el ancho, todo en español.
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
      <FooterSection />
    </div>
  );
}
