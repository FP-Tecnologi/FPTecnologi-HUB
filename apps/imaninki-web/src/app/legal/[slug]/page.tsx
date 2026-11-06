import { notFound } from 'next/navigation';
import Banner from '@/components/Banner';
import Reveal from '@/components/Reveal';
import JsonLd from '@/components/JsonLd';
import { getPagina } from '@/lib/cms';
import { LEGAL_SLUGS, parrafosDe, rellenar, titularDe, type LegalSlug } from '@/lib/legal';
import { getProveedor } from '@/lib/proveedor';
import { meta, migas } from '@/lib/seo';

// Los textos se editan en el dashboard: una vez publicados, funcionan sin volver a compilar.
export const revalidate = 30;
export const generateStaticParams = () => LEGAL_SLUGS.map((slug) => ({ slug }));

/** Texto vigente; null si el slug no existe o los textos legales aún no se publicaron (borrador). */
async function documento(slug: string) {
  if (!LEGAL_SLUGS.includes(slug as LegalSlug)) return null;
  const c = await getPagina('legal');
  if (!c.estado.publicado) return null;
  return c[slug as LegalSlug];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await documento(slug);
  return d ? { ...meta(d.titulo, `${d.titulo} de Imaninki.`, `/legal/${slug}`), robots: { index: true, follow: true } } : { title: 'Legal' };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await documento(slug);
  if (!d) notFound();
  const titular = titularDe(await getProveedor());
  return (
    <main id="contenido">
      <JsonLd datos={migas([{ nombre: d.titulo, ruta: `/legal/${slug}` }])} />
      <Banner miga="Legales" titulo={d.titulo} foto="/fotos/equipo.webp" />
      <Reveal className="mx-auto max-w-3xl space-y-4 px-5 py-16 leading-relaxed text-carbon/85 sm:px-8">
        {parrafosDe(rellenar(d.texto, titular)).map((t, i) =>
          t.startsWith('## ') ? (
            <h2 key={i} className="pt-4 text-xl font-bold text-carbon">{t.slice(3)}</h2>
          ) : (
            <p key={i}>{t}</p>
          ),
        )}
      </Reveal>
    </main>
  );
}
