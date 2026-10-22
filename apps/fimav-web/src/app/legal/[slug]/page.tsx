import { notFound } from 'next/navigation';
import SeccionTitulo from '@/components/SeccionTitulo';
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
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <SeccionTitulo nivel="h1" tam="lg" claro={p.titulo.split(' ').slice(0, -1).join(' ')} rojo={p.titulo.split(' ').at(-1)} subtitulo="Información legal de Fimav Perú." />
      <div className="mt-8 space-y-4 leading-relaxed text-carbon/80">
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
