import type { Metadata } from 'next';
import { Download, FileText } from 'lucide-react';
import Banner from '@/components/Banner';
import Reveal from '@/components/Reveal';
import Titulo from '@/components/Titulo';
import { CtaContacto } from '@/components/Bloques';
import JsonLd from '@/components/JsonLd';
import { meta, migas } from '@/lib/seo';
import { getPagina, urlArchivo } from '@/lib/cms';

export const metadata: Metadata = meta('Catálogos', 'Descarga los catálogos de Imaninki en PDF: líneas, productos y fichas.', '/catalogos');

const contenedor = 'mx-auto max-w-7xl px-5 sm:px-8';

export default async function Catalogos() {
  const { banner, lista } = await getPagina('catalogos');
  const items = lista.items.filter((x) => x.titulo && x.archivo);
  return (
    <main id="contenido">
      <JsonLd datos={migas([{ nombre: 'Catálogos', ruta: '/catalogos' }])} />
      <Banner miga="Catálogos" titulo={banner.titulo} acento={banner.acento} texto={banner.texto} foto="/fotos/equipo.webp" />
      <section className="py-20 sm:py-24">
        <div className={contenedor}>
          <Reveal><Titulo etiqueta="Documentos" solido="Catálogos para" acento="descargar" /></Reveal>
          {items.length === 0 ? (
            <p className="mt-10 text-lg text-carbon/80">Pronto publicaremos nuestros catálogos. Mientras tanto, escríbenos y te los enviamos.</p>
          ) : (
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((c, i) => (
                <Reveal as="li" key={`${c.titulo}-${i}`} retraso={i * 80}>
                  <a href={urlArchivo(c.archivo)} target="_blank" rel="noopener noreferrer" className="tarjeta group flex h-full items-center gap-4 rounded-2xl border border-rojo/15 bg-white p-5 shadow-lg shadow-carbon/10">
                    <span className="icono-caja grid size-14 shrink-0 place-items-center rounded-2xl bg-rojo text-white"><FileText aria-hidden="true" size={26} /></span>
                    <span className="min-w-0">
                      <span className="block break-words text-lg font-bold">{c.titulo}</span>
                      <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-rojo-hondo"><Download aria-hidden="true" size={15} />Ver / descargar PDF</span>
                    </span>
                  </a>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>
      <CtaContacto />
    </main>
  );
}
