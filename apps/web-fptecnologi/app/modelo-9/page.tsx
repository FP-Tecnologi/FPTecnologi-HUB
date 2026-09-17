import { Footer } from '@/components/site/Footer';
import { Hero9 } from '@/components/site9/Hero9';

export const metadata = { title: 'Modelo 9' };

/*
 * Modelo 9 -- inspirado en la estructura/mecánica de un spec de referencia
 * de "RIVR" (dashboard DeFi): tarjeta hero a pantalla completa con foto de
 * fondo, nav de vidrio y 2 tarjetas flotantes. Contenido reemplazado por
 * FPTecnologi -- ver comentarios de Navbar9/Hero9 (nada de "Fluid Asset
 * Streams"/staking/vaults/Discord, nada de video de CloudFront, nada de
 * lucide-react/motion, nada de la fuente Helvetica de onlinewebfonts.com).
 * Se agrega el Footer real del sitio debajo del hero -- el spec original
 * era una landing de una sola sección, pero este modelo está catalogado en
 * /modelos junto a los otros 8 (todos con footer real), así que amerita
 * cerrar la página en vez de dejarla trunca.
 */
export default function Modelo9Page() {
  return (
    <>
      <main>
        <Hero9 />
      </main>
      <Footer />
    </>
  );
}
