import { notFound } from 'next/navigation';
import BannerPagina from '@/components/BannerPagina';
import { legal } from '@/lib/legal';

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(legal).map((slug) => ({ slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: legal[(await params).slug]?.titulo ?? 'Legal' };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = legal[(await params).slug];
  if (!p) notFound();
  return (
    <main>
      <BannerPagina titulo={p.titulo.split(' ').slice(0, -1).join(' ')} resaltado={p.titulo.split(' ').at(-1)} subtitulo="Información legal de Fimav Perú." imagen="/fotos/nosotros.jpg" posicion="center 80%" />
      <div className="mx-auto max-w-3xl space-y-4 px-4 pb-16 pt-8 leading-relaxed text-carbon/80 sm:px-6">
        {p.parrafos.map((t) =>
          t.startsWith('## ') ? (
            <h2 key={t} className="titulo-menor pt-4 text-xl text-carbon">{t.slice(3)}</h2>
          ) : (
            <p key={t}>{t}</p>
          ),
        )}
      </div>
    </main>
  );
}
