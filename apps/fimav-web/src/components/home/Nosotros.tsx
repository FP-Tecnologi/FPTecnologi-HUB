import SeccionTitulo from '@/components/SeccionTitulo';
import Reveal from '@/components/motion/Reveal';
import HexImagen from '@/components/hex/HexImagen';
import { contenido } from '@/lib/contenido';

export default function Nosotros() {
  return (
    <section className="bg-gris py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <SeccionTitulo nivel="h2" claro="Sobre" rojo="Nosotros" subtitulo="Especialistas en Bienes y Servicios" />
          <p className="mt-6 leading-relaxed text-carbon/80">{contenido.nosotros}</p>
        </Reveal>
        <Reveal retraso={120}>
          <HexImagen src="/fotos/nosotros.jpg" alt="Equipo y soluciones tecnológicas de Fimav Perú" sizes="(min-width: 1024px) 400px, 90vw" className="mx-auto w-full max-w-sm" />
        </Reveal>
      </div>
    </section>
  );
}
