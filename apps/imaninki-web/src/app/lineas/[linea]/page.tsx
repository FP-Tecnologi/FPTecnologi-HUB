import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import Banner from '@/components/Banner';
import Reveal from '@/components/Reveal';
import Titulo from '@/components/Titulo';
import { CtaContacto } from '@/components/Bloques';
import JsonLd from '@/components/JsonLd';
import { lineas, waUrl } from '@/lib/contenido';
import { jsonLinea, meta, migas } from '@/lib/seo';

type Params = { params: Promise<{ linea: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => lineas.map((l) => ({ linea: l.id }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { linea } = await params;
  const l = lineas.find((x) => x.id === linea);
  return l ? meta(l.nombre, `${l.lema} ${l.texto}`, `/lineas/${l.id}`) : {};
}

const contenedor = 'mx-auto max-w-7xl px-5 sm:px-8';

export default async function PaginaLinea({ params }: Params) {
  const { linea } = await params;
  const l = lineas.find((x) => x.id === linea);
  if (!l) notFound();
  const otras = lineas.filter((x) => x.id !== l.id);
  // La palabra final del nombre va resaltada («Línea de *Pinturas*»).
  const [solido, acento] = l.nombre.includes(' de ') ? [l.nombre.split(' de ')[0] + ' de', l.nombre.split(' de ')[1]] : [l.nombre.split(' y ')[0] + ' y', l.nombre.split(' y ')[1]];

  return (
    <main id="contenido">
      <JsonLd datos={[migas([{ nombre: l.corto, ruta: `/lineas/${l.id}` }]), jsonLinea(l.id)]} />
      <Banner miga={l.corto} titulo={solido} acento={acento} texto={l.lema} foto={l.foto} />

      {/* Intro */}
      <section className="py-20 sm:py-24">
        <div className={`${contenedor} grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]`}>
          <Reveal efecto="izquierda">
            <Titulo etiqueta={`${l.productos.length} productos`} solido="Soluciones que" acento="rinden en obra" />
            <p className="mt-6 text-lg leading-relaxed">{l.texto}</p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {l.productos.map((p) => (
                <li key={p.nombre} className="flex items-center gap-2 text-carbon/90">
                  <CheckCircle2 aria-hidden="true" size={18} className="shrink-0 text-rojo" />{p.nombre}
                </li>
              ))}
            </ul>
            <a href={waUrl(`Hola Imaninki, quisiera cotizar productos de la ${l.nombre}.`)} target="_blank" rel="noopener noreferrer" className="boton mt-8 inline-flex h-13 items-center gap-2 rounded-xl bg-rojo px-6 font-semibold text-white shadow-lg shadow-rojo-hondo/35 hover:bg-rojo-hondo">
              <MessageCircle aria-hidden="true" size={20} className="icono-sacude" />Cotizar esta línea
            </a>
          </Reveal>
          <Reveal efecto="derecha" className="group grid grid-cols-2 gap-4">
            {l.galeria.slice(0, 2).map((g, i) => (
              <div key={g.src} className={`overflow-hidden rounded-[1.75rem] shadow-xl shadow-rojo-hondo/15 ${i ? 'mt-10 rounded-tr-[4rem]' : 'rounded-bl-[4rem]'}`}>
                <img loading="lazy" decoding="async" src={g.src} alt={g.alt} className="foto-zoom aspect-[3/4] w-full object-cover" />
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Productos */}
      <section className="bg-niebla py-20 sm:py-24">
        <div className={contenedor}>
          <Reveal><Titulo centro etiqueta="Catálogo" solido="Conoce cada" acento="producto" /></Reveal>
          <div className="mt-14 grid gap-8">
            {l.productos.map((p, i) => (
              <Reveal key={p.nombre} efecto={i % 2 ? 'derecha' : 'izquierda'}>
                <article className="group grid items-center gap-8 overflow-hidden rounded-[2rem] bg-white p-6 shadow-xl shadow-rojo-hondo/10 transition-shadow duration-500 hover:shadow-2xl hover:shadow-rojo-hondo/20 sm:p-8 md:grid-cols-[0.8fr_1.2fr]">
                  <div className={`relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-niebla to-rojo/15 ${i % 2 ? 'md:order-2' : ''}`}>
                    <img loading="lazy" decoding="async" src="/icon.svg" alt="" aria-hidden="true" className="absolute -bottom-10 -right-10 w-48 opacity-[0.07] transition duration-1000 group-hover:rotate-12" />
                    <img decoding="async" src={p.img} alt="" loading="lazy" className="relative max-h-[85%] max-w-[85%] rounded-xl object-contain drop-shadow-2xl transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-105" />
                  </div>
                  <div>
                    <span className="font-titulo text-sm font-bold text-rojo">{String(i + 1).padStart(2, '0')}</span>
                    <h2 className="mt-1 text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold transition-colors duration-500 group-hover:text-rojo-hondo">{p.nombre}</h2>
                    <p className="mt-2 font-semibold text-rojo-hondo">{p.detalle}</p>
                    <p className="mt-4 leading-relaxed text-carbon/90">{p.descripcion}</p>
                    <a href={waUrl(`Hola Imaninki, quisiera cotizar ${p.nombre}.`)} target="_blank" rel="noopener noreferrer" className="boton mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-rojo/10 px-5 font-semibold text-rojo-hondo hover:bg-rojo hover:text-white">
                      <MessageCircle aria-hidden="true" size={18} className="icono-sacude" />Cotizar {p.nombre.replace(/^(Línea|Pintura) /, '')}
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Galería */}
      <section className="py-20 sm:py-24">
        <div className={contenedor}>
          <Reveal><Titulo etiqueta="En acción" solido="Así luce" acento="en cada proyecto" /></Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {l.galeria.map((g, i) => (
              <Reveal key={g.src} efecto="zoom" retraso={i * 100} className="group overflow-hidden rounded-[1.75rem] shadow-lg shadow-rojo-hondo/10">
                <img decoding="async" src={g.src} alt={g.alt} loading="lazy" className="foto-zoom aspect-[4/3] w-full object-cover" />
              </Reveal>
            ))}
          </div>

          <h2 className="mt-20 text-2xl font-extrabold">Otras líneas</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {otras.map((o) => (
              <Link key={o.id} href={`/lineas/${o.id}`} className="tarjeta group relative isolate flex min-h-40 items-end overflow-hidden rounded-[1.75rem] p-6 text-white">
                <img loading="lazy" decoding="async" src={o.foto} alt="" className="foto-zoom absolute inset-0 -z-20 size-full object-cover" />
                <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-tinta via-tinta/60 to-tinta/10" />
                <span className="flex-1">
                  <b className="block font-titulo text-xl">{o.nombre}</b>
                  <span className="text-sm text-white/80">{o.lema}</span>
                </span>
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/30 transition duration-300 group-hover:border-rojo group-hover:bg-rojo">
                  <ArrowRight aria-hidden="true" size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaContacto />
    </main>
  );
}
