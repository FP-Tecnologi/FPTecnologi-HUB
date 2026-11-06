import type { Metadata } from 'next';
import { Compass, Gem, Handshake, Lightbulb, ShieldCheck, Target } from 'lucide-react';
import Banner from '@/components/Banner';
import Reveal from '@/components/Reveal';
import Titulo from '@/components/Titulo';
import { Clientes, CtaContacto } from '@/components/Bloques';
import JsonLd from '@/components/JsonLd';
import { meta, migas } from '@/lib/seo';
import { getPagina } from '@/lib/cms';

export const metadata: Metadata = meta('Nosotros', 'Kelqa desarrolla soluciones confiables, eficientes y de alto valor para los sectores industrial y construcción. Conoce nuestra misión, visión y valores.', '/nosotros');

const contenedor = 'mx-auto max-w-7xl px-5 sm:px-8';
const ICONOS_VALOR = [Lightbulb, Handshake, ShieldCheck, Gem];

export default async function Nosotros() {
  const c = await getPagina('nosotros');
  const { banner, quienes, valores, propuesta } = c;
  return (
    <main id="contenido">
      <JsonLd datos={migas([{ nombre: 'Nosotros', ruta: '/nosotros' }])} />
      <Banner miga="Nosotros" titulo={banner.titulo} acento={banner.acento} texto={banner.texto} foto="/fotos/equipo.webp" />

      {/* Quiénes somos */}
      <section className="py-20 sm:py-24">
        <div className={`${contenedor} grid items-center gap-14 lg:grid-cols-2`}>
          <Reveal efecto="izquierda">
            <Titulo etiqueta={quienes.etiqueta} solido={quienes.titulo} acento={quienes.acento} />
            <p className="mt-6 text-lg leading-relaxed">
              {quienes.texto}
            </p>
            <p className="mt-4 leading-relaxed text-carbon/85">
              {quienes.texto2}
            </p>
            <p className="mt-4 leading-relaxed text-carbon/85">
              {quienes.texto3}
            </p>
          </Reveal>
          <Reveal efecto="derecha" className="group relative">
            <div className="overflow-hidden rounded-[2rem] rounded-tl-[6rem] shadow-2xl shadow-kelqa-hondo/25">
              <img loading="lazy" decoding="async" src="/fotos/obra.webp" alt="Obra en construcción" className="foto-zoom aspect-[4/3.6] w-full object-cover" />
            </div>
            <div className="flotar absolute -bottom-8 -left-2 max-w-xs rounded-2xl bg-tinta p-5 text-white shadow-xl shadow-tinta/30 sm:-left-8">
              <p className="font-titulo text-lg font-bold leading-snug">{quienes.destacado}</p>
              <p className="mt-1 text-sm text-white/75">{quienes.destacadoTexto}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Misión y visión */}
      <section className="bg-niebla py-20 sm:py-24">
        <div className={`${contenedor} grid gap-6 md:grid-cols-2`}>
          {[
            { t: 'Misión', d: c.mision.mision, Icono: Target },
            { t: 'Visión', d: c.mision.vision, Icono: Compass },
          ].map(({ t, d, Icono }, i) => (
            <Reveal key={t} efecto={i ? 'derecha' : 'izquierda'}>
              <div className="group h-full rounded-[2rem] bg-white p-8 shadow-lg shadow-kelqa-hondo/10 ring-1 ring-transparent transition duration-500 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-kelqa-hondo/15 hover:ring-kelqa/15 sm:p-10">
                <span className="icono-caja grid size-14 place-items-center rounded-2xl bg-kelqa text-white shadow-lg shadow-kelqa-hondo/30"><Icono aria-hidden="true" size={26} /></span>
                <h2 className="mt-6 text-3xl font-extrabold transition-colors duration-500 group-hover:text-kelqa-hondo">{t}</h2>
                <p className="mt-4 text-lg leading-relaxed text-carbon/90">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 sm:py-24">
        <div className={contenedor}>
          <Reveal><Titulo centro etiqueta={valores.etiqueta} solido={valores.titulo} acento={valores.acento} /></Reveal>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {valores.items.map((v, i) => {
              const Icono = ICONOS_VALOR[i % ICONOS_VALOR.length];
              return (
                <Reveal as="li" key={v.nombre} retraso={i * 100}>
                  <div className="tarjeta group relative h-full overflow-hidden rounded-[1.75rem] border border-kelqa/10 bg-white p-7 shadow-lg shadow-kelqa-hondo/10">
                    <span aria-hidden="true" className="absolute -right-10 -top-10 size-32 rounded-[2rem] bg-kelqa/5 transition duration-700 group-hover:rotate-45 group-hover:scale-125 group-hover:bg-kelqa/10" />
                    <span className="icono-caja relative grid size-14 place-items-center rounded-2xl bg-kelqa text-white shadow-lg shadow-kelqa-hondo/30 group-hover:bg-kelqa-hondo"><Icono aria-hidden="true" size={26} /></span>
                    <h3 className="relative mt-5 text-xl font-bold">{v.nombre}</h3>
                    <p className="relative mt-2 leading-relaxed text-carbon/85">{v.texto}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Propuesta */}
      <section className="px-5 sm:px-8">
        <Reveal efecto="zoom" className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] rounded-tr-[7rem] bg-tinta p-8 text-white sm:p-14">
          <img loading="lazy" decoding="async" src="/icon.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 -z-10 w-80 opacity-10" />
          <Titulo oscuro etiqueta={propuesta.etiqueta} solido={propuesta.titulo} acento={propuesta.acento} />
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {propuesta.items.map((t, i) => (
              <Reveal as="li" key={i} retraso={i * 120} className="border-t border-white/15 pt-6">
                <span className="font-titulo text-4xl font-extrabold text-kelqa-claro/70">0{i + 1}</span>
                <p className="mt-3 leading-relaxed text-white/85">{t.texto}</p>
              </Reveal>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="py-20 sm:py-24">
        <div className={contenedor}>
          <Clientes />
        </div>
      </section>

      <CtaContacto />
    </main>
  );
}
