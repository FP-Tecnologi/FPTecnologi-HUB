import Reveal from '@/components/motion/Reveal';
import Espiral from '@/components/Espiral';
import SeccionTitulo from '@/components/SeccionTitulo';
import CorteHex from '@/components/hex/CorteHex';
import { contenido } from '@/lib/contenido';

export const metadata = { title: 'Nosotros' };

export default function NosotrosPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-white py-16 lg:py-24">
        <Espiral contorno className="aparecer pointer-events-none absolute -right-24 -top-24 w-80 opacity-20" />
        <div className="entrada relative mx-auto max-w-6xl px-4 sm:px-6">
          <SeccionTitulo nivel="h1" tam="lg" claro="Sobre" rojo="Fimav Perú" subtitulo="Especialistas en Bienes y Servicios" />
          <SeccionTitulo nivel="h2" className="mt-14" claro="Nuestra" rojo="Misión" subtitulo="Entre los primeros proveedores de Gobierno y Privado." />
          <p className="mt-6 max-w-3xl leading-relaxed text-carbon/80">{contenido.mision}</p>
        </div>
      </section>
      <section className="bg-white">
        <CorteHex lado="arriba" color="var(--color-carbon)" />
        <div className="bg-carbon py-16 text-white lg:py-24">
          <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">
            <SeccionTitulo nivel="h2" claroSobreOscuro claro="Nuestra" rojo="Visión" subtitulo="Un proveedor internacional con sostenibilidad empresarial." />
            <p className="mt-6 max-w-3xl leading-relaxed text-white/90">{contenido.vision}</p>
          </Reveal>
        </div>
        <CorteHex lado="abajo" color="var(--color-carbon)" />
      </section>
      <section className="bg-white py-16">
        <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">
          <SeccionTitulo nivel="h2" claro="Quiénes" rojo="somos" subtitulo="Una organización en constante transformación." />
          <p className="mt-6 max-w-3xl leading-relaxed text-carbon/80">{contenido.frase}</p>
        </Reveal>
      </section>
    </main>
  );
}
