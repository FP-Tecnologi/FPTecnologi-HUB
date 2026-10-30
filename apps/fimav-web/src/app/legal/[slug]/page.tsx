import { notFound } from 'next/navigation';
import BannerPagina from '@/components/BannerPagina';
import Reveal from '@/components/motion/Reveal';
import { CMS_DEFAULTS, getPagina, parrafosDe } from '@/lib/cms';
import { meta } from '@/lib/seo';

type Slug = keyof (typeof CMS_DEFAULTS)['legal'];
const SLUGS = Object.keys(CMS_DEFAULTS.legal) as Slug[];

export const dynamicParams = false;
export const generateStaticParams = () => SLUGS.map((slug) => ({ slug }));

/** Texto vigente (Administrador → Web Fimav → Textos legales); null si el slug no existe. */
async function documento(slug: string) {
  if (!SLUGS.includes(slug as Slug)) return null;
  return (await getPagina('legal'))[slug as Slug];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await documento(slug);
  return d ? { ...meta(d.titulo, `${d.titulo} de Fimav Perú.`, `/legal/${slug}`), robots: { index: true, follow: true } } : { title: 'Legal' };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await documento((await params).slug);
  if (!p) notFound();
  return (
    <main id="contenido">
      <BannerPagina eyebrow="Legales" titulo={p.titulo} imagen="/fotos/nosotros.jpg" posicion="center 80%" />
      <Reveal className="mx-auto max-w-3xl space-y-4 px-4 pb-16 pt-8 leading-relaxed text-carbon/80 sm:px-6">
        {parrafosDe(p.texto).map((t, i) =>
          t.startsWith('## ') ? (
            <h2 key={i} className="titulo-menor pt-4 text-xl text-carbon">{t.slice(3)}</h2>
          ) : (
            <p key={i}>{t}</p>
          ),
        )}
      </Reveal>
    </main>
  );
}
