import { Header8 } from '@/components/site8/Header8';
import { Hero8 } from '@/components/site8/Hero8';
import { Stats8 } from '@/components/site8/Stats8';

export const metadata = { title: 'Modelo 8' };

/*
 * Modelo 8 -- inspirado en la estructura/mecánica de un spec de referencia
 * de "Vesper.ai" (SaaS de IA): hero de una sola pantalla, negro, con nav en
 * pastillas de metal líquido y CTAs de vidrio. Todo el contenido reemplazado
 * por FPTecnologi -- ver comentarios de Header8/Hero8/Stats8 para el detalle
 * de cada reemplazo (nada de "AI agents"/"workflows", nada de video de
 * CloudFront, nada de lucide-react/motion, nada de la fuente WOFF2 propia).
 * A diferencia del spec original no forzamos el "lock" de scroll a pantalla
 * completa en desktop (html/body overflow:hidden) -- simplificación
 * deliberada: ese hack es frágil entre navegadores/zoom y no aporta nada al
 * objetivo real (mostrar la propuesta visual), min-h-screen + flex alcanza.
 */
export default function Modelo8Page() {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white"
      style={{ background: 'radial-gradient(ellipse 120% 70% at 50% 0%, #1a1a1a 0%, #000000 60%)' }}
    >
      <Header8 />
      <Hero8 />
      <Stats8 />
    </div>
  );
}
