import { contenido } from '@/lib/contenido';

export const hexRecorte = 'polygon(25% 4%, 75% 4%, 98% 50%, 75% 96%, 25% 96%, 2% 50%)';

export default function Nosotros() {
  return (
    <section className="bg-gris py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-2xl font-medium italic text-rojo">Especialistas en Bienes y Servicios</p>
          <p className="mt-4 leading-relaxed text-carbon/80">{contenido.nosotros}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fotos/nosotros.jpg" alt="Equipo y soluciones tecnológicas de Fimav Perú" loading="lazy" className="mx-auto aspect-[1.1] w-full max-w-md object-cover" style={{ clipPath: hexRecorte }} />
      </div>
    </section>
  );
}
