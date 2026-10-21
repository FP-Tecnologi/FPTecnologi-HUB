import Link from 'next/link';
import { notFound } from 'next/navigation';
import Hexagono from '@/components/Hexagono';
import { categoriaPorSlug, categorias } from '@/lib/categorias';

export const dynamicParams = false;
export const generateStaticParams = () => categorias.map((c) => ({ categoria: c.slug }));

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }) {
  const c = categoriaPorSlug((await params).categoria);
  return { title: c?.nombre ?? 'Catálogo' };
}

export default async function CategoriaPage({ params }: { params: Promise<{ categoria: string }> }) {
  const c = categoriaPorSlug((await params).categoria);
  if (!c) notFound();
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Hexagono icono={c.icono} tam={72} />
      <h1 className="mt-4 text-4xl font-medium text-carbon">{c.nombre}</h1>
      <p className="mt-3 max-w-2xl text-carbon/80">{c.resumen}</p>
      {c.marcas.length > 0 && <p className="mt-4 text-sm font-medium text-rojo-hondo">Marcas: {c.marcas.join(' · ')}</p>}
      {c.fotos.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {c.fotos.map((f, n) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={f} src={f} alt={`${c.nombre}, ejemplo ${n + 1}`} loading="lazy" className="aspect-square w-full rounded-2xl border border-carbon/20 object-cover" />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-2xl border border-carbon/20 bg-gris p-6 text-carbon/80">Consulta disponibilidad con nuestro equipo.</p>
      )}
      <Link href={`/cotizar?categoria=${c.slug}`} className="mt-10 inline-block rounded-full bg-boton px-7 py-3 font-medium text-white">
        Cotizar {c.nombre}
      </Link>
    </main>
  );
}
