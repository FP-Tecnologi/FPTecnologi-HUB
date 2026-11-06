import type { Metadata } from 'next';
import Banner from '@/components/Banner';
import Reveal from '@/components/Reveal';
import Titulo from '@/components/Titulo';
import { CtaContacto, Listos, MisionVision, Quienes } from '@/components/Bloques';
import JsonLd from '@/components/JsonLd';
import { meta, migas } from '@/lib/seo';
import { valoresDetalle } from '@/lib/contenido';
import { getPagina } from '@/lib/cms';

export const metadata: Metadata = meta('Nosotros', 'Imaninki desarrolla soluciones confiables, eficientes y de alto valor para los sectores industrial y construcción. Conoce nuestra misión, visión y valores.', '/nosotros');

export default async function Nosotros() {
  const { quienes } = await getPagina('inicio');
  return (
    <main id="contenido">
      <JsonLd datos={migas([{ nombre: 'Nosotros', ruta: '/nosotros' }])} />
      <Banner miga="Nosotros" titulo="Un aliado estratégico" acento="en cada etapa" texto="Más que proveer productos, acompañamos cada etapa de tu proyecto con atención personalizada y asesoría." foto="/fotos/equipo.webp" />
      <Quienes texto={quienes.texto} texto2={quienes.texto2} />
      <MisionVision />

      <section className="bg-niebla py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal><Titulo etiqueta="Lo que nos define" solido="Nuestros" acento="valores" /></Reveal>
          <ol className="mt-12 grid gap-px bg-carbon/15 sm:grid-cols-2 lg:grid-cols-4">
            {valoresDetalle.map((v, i) => (
              <Reveal as="li" key={v.nombre} retraso={i * 90} className="bg-white">
                <div className="h-full border-t-4 border-rojo p-7">
                  <span className="text-4xl font-black text-rojo/30">0{i + 1}</span>
                  <h3 className="mt-3 text-xl font-extrabold">{v.nombre}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-carbon/85">{v.texto}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <Listos />
      <CtaContacto />
    </main>
  );
}
