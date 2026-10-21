import { notFound } from 'next/navigation';
import Hexagono from '@/components/Hexagono';
import BotonHex from '@/components/hex/BotonHex';
import HexImagen from '@/components/hex/HexImagen';
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
            <HexImagen key={f} src={f} alt={`${c.nombre}, ejemplo ${n + 1}`} sizes="(min-width: 640px) 33vw, 90vw" />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-2xl border border-carbon/20 bg-gris p-6 text-carbon/80">Consulta disponibilidad con nuestro equipo.</p>
      )}
      <BotonHex href={`/cotizar?categoria=${c.slug}`} size="lg" className="mt-10">
        Cotizar {c.nombre}
      </BotonHex>
    </main>
  );
}
