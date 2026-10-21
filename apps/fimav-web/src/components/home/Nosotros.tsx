import HexImagen from '@/components/hex/HexImagen';
import { contenido } from '@/lib/contenido';

export default function Nosotros() {
  return (
    <section className="bg-gris py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="sr-only">Sobre nosotros</h2>
          <p className="text-2xl font-medium italic text-rojo">Especialistas en Bienes y Servicios</p>
          <p className="mt-4 leading-relaxed text-carbon/80">{contenido.nosotros}</p>
        </div>
        <HexImagen src="/fotos/nosotros.jpg" alt="Equipo y soluciones tecnológicas de Fimav Perú" sizes="(min-width: 1024px) 400px, 90vw" className="mx-auto w-full max-w-sm" />
      </div>
    </section>
  );
}
