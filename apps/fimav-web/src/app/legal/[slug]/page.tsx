import { notFound } from 'next/navigation';
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
      <h1 className="text-4xl font-medium text-carbon">{p.titulo}</h1>
      <span aria-hidden="true" className="mt-3 block h-1 w-16 rounded-full bg-rojo" />
      <div className="mt-8 space-y-4 leading-relaxed text-carbon/80">
        {p.parrafos.map((t) =>
          t.startsWith('## ') ? (
            <h2 key={t} className="pt-4 text-xl font-medium text-carbon">{t.slice(3)}</h2>
          ) : t.startsWith('Texto referencial') ? (
            <p key={t} className="rounded-2xl border border-carbon/20 bg-gris p-4 text-sm font-medium text-rojo-hondo">{t}</p>
          ) : (
            <p key={t}>{t}</p>
          ),
        )}
      </div>
    </main>
  );
}
