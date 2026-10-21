import Link from 'next/link';
import Espiral from '@/components/Espiral';
import Titulo from '@/components/Titulo';
import { contenido } from '@/lib/contenido';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <Espiral className="pointer-events-none absolute -right-24 -top-28 w-[300px] opacity-25 sm:opacity-100 animate-[giro_60s_linear_infinite] sm:-right-32 sm:-top-24 sm:w-[560px]" />
      <Espiral contorno className="pointer-events-none absolute -bottom-32 -left-28 w-56 opacity-40 sm:-bottom-24 sm:-left-24 sm:opacity-60" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-32">
        <Titulo nivel="h1" claro={contenido.hero.linea1} rojo={contenido.hero.linea2} className="max-w-xl text-4xl sm:text-5xl lg:text-6xl" />
        <p className="mt-6 max-w-md text-lg text-carbon/80">Proveedor corporativo y de gobierno con más de 10 años de experiencia</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/cotizar" className="rounded-full bg-boton px-6 py-3 font-semibold text-white">Solicitar cotización</Link>
          <Link href="/catalogo" className="rounded-full border-2 border-rojo-hondo px-6 py-3 font-semibold text-rojo-hondo">Ver catálogo</Link>
        </div>
      </div>
    </section>
  );
}
