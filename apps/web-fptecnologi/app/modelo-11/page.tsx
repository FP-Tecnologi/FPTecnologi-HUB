import { Header11 } from '@/components/site11/Header11';
import { Hero11 } from '@/components/site11/Hero11';
import { Featured11 } from '@/components/site11/Featured11';
import { Footer11 } from '@/components/site11/Footer11';

export const metadata = { title: 'Modelo 11' };

/*
 * Modelo 11 -- inspirado en una tienda tech oscura con acento violeta
 * (referencia: tienda de periféricos gaming). A propósito se queda corto
 * (Header + Hero + Destacados + Footer), igual que la referencia: esa
 * página tampoco tenía más secciones, así que sumarle Servicios/Nosotros/
 * FAQ acá sería inflarla sin motivo -- no todos los modelos necesitan la
 * home completa (ver Modelo 10 para la versión larga).
 *
 * Contenido real de FPTecnologi: FEATURED_PRODUCTS (4 monitores reales) en
 * vez de periféricos gaming inventados, carrito real (CartContext), sin
 * paginación falsa (solo hay una página de productos reales), sin
 * newsletter ni íconos de tarjeta (no hay backend de correo ni pasarela de
 * pago -- el checkout real termina en "Contactar").
 */
export default function Modelo11Page() {
  return (
    <div className="bg-[#0d0b14]">
      <Header11 />
      <Hero11 />
      <Featured11 />
      <Footer11 />
    </div>
  );
}
