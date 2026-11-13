import { getContacto, waUrlDe } from '@/lib/cms';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import Banner from '@/components/Banner';
import Reveal from '@/components/Reveal';
import { BandaProducto, CtaContacto } from '@/components/Bloques';
import JsonLd from '@/components/JsonLd';
import { getLineas } from '@/lib/lineas';
import { jsonLinea, meta, migas } from '@/lib/seo';
import { IconoWhatsApp } from '@/components/WhatsApp';

type Params = { params: Promise<{ linea: string }> };

// Las líneas se crean desde el dashboard: una línea nueva funciona sin volver a compilar la web.
export const revalidate = 30;
export const generateStaticParams = async () => (await getLineas()).map((l) => ({ linea: l.id }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { linea } = await params;
  const l = (await getLineas()).find((x) => x.id === linea);
  return l ? meta(l.nombre, `${l.lema} ${l.texto}`, `/lineas/${l.id}`) : {};
}

const contenedor = 'mx-auto max-w-7xl px-5 sm:px-8';

export default async function PaginaLinea({ params }: Params) {
  const contacto = await getContacto();
  const waUrl = (t: string) => waUrlDe(contacto.whatsapp, t);
  const { linea } = await params;
  const lineas = await getLineas();
  const l = lineas.find((x) => x.id === linea);
  if (!l) notFound();
  const otras = lineas.filter((x) => x.id !== l.id);
  // La palabra final del nombre va resaltada («Línea de *Pinturas*»).
  const [solido, acento] = l.nombre.includes(' de ') ? [l.nombre.split(' de ')[0] + ' de', l.nombre.split(' de ')[1]] : [l.nombre.split(' y ')[0] + ' y', l.nombre.split(' y ')[1]];

  return (
    <main id="contenido">
      <JsonLd datos={[migas([{ nombre: l.corto, ruta: `/lineas/${l.id}` }]), jsonLinea(l)]} />
      <Banner miga={l.corto} titulo={solido} acento={acento} texto={l.lema} foto={l.foto} />

      {/* Productos en bandas rojas, como las páginas de línea del brochure */}
      <section className="py-16 sm:py-20">
        <div className={contenedor}>
          <Reveal>
            <p className="max-w-3xl text-lg leading-relaxed">{l.texto}</p>
          </Reveal>
          <div className="mt-8">
            {l.productos.map((p, i) => <BandaProducto key={p.nombre} p={p} i={i} />)}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={waUrl(`Hola Imaninki, quisiera cotizar productos de la ${l.nombre}.`)} target="_blank" rel="noopener noreferrer" className="boton inline-flex h-13 items-center gap-2 rounded-md bg-rojo px-7 font-bold uppercase tracking-wide text-white shadow-lg shadow-rojo/30 hover:bg-rojo-hondo">
              <IconoWhatsApp className="icono-sacude size-5"/>Cotizar esta línea
            </a>
          </div>
        </div>
      </section>

      {/* Galería a foto completa */}
      <section className="fondo-negro py-16 text-white">
        <div className={`${contenedor} grid gap-4 ${l.galeria.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
          {l.galeria.map((g, i) => (
            <Reveal key={g.src} retraso={i * 100}>
              <div className="group overflow-hidden border-b-4 border-rojo">
                <img loading="lazy" decoding="async" src={g.src} alt={g.alt} className="foto-zoom aspect-[4/5] w-full object-cover" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Otras líneas */}
      <section className="py-16 sm:py-20">
        <div className={`${contenedor} grid gap-4 sm:grid-cols-2`}>
          {otras.map((o) => (
            <Link key={o.id} href={`/lineas/${o.id}`} className="group relative isolate flex min-h-52 items-end overflow-hidden bg-tinta p-6 text-white">
              <img loading="lazy" decoding="async" src={o.foto} alt="" className="foto-zoom absolute inset-0 -z-20 size-full object-cover" />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-tinta via-tinta/50 to-tinta/10" />
              <span>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-rojo-claro">Otra línea</span>
                <b className="mt-1 flex items-center gap-2 font-titulo text-xl">{o.nombre}<ArrowRight aria-hidden="true" size={18} className="transition-transform duration-300 group-hover:translate-x-1.5" /></b>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <CtaContacto />
    </main>
  );
}
