import { notFound } from 'next/navigation';
import { FileText } from 'lucide-react';
import Hexagono from '@/components/Hexagono';
import BannerPagina from '@/components/BannerPagina';
import BotonHex from '@/components/hex/BotonHex';
import HexImagen from '@/components/hex/HexImagen';
import Reveal from '@/components/motion/Reveal';
import { getCategorias } from '@/lib/cms';
import JsonLd from '@/components/JsonLd';
import { jsonCategoria, meta, migas } from '@/lib/seo';

const categoriaPorSlug = async (slug: string) => (await getCategorias()).find((c) => c.slug === slug);

// Las categorías se crean desde el dashboard: una nueva funciona sin volver a compilar la web.
export const revalidate = 30;
export const generateStaticParams = async () => (await getCategorias()).map((c) => ({ categoria: c.slug }));

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }) {
  const c = await categoriaPorSlug((await params).categoria);
  return c ? meta(`${c.nombre}: catálogo y cotización`, `${c.resumen}${c.marcas.length ? ` Marcas: ${c.marcas.join(', ')}.` : ''} Cotiza con Fimav Perú.`, `/catalogo/${c.slug}`) : { title: 'Catálogo' };
}

export default async function CategoriaPage({ params }: { params: Promise<{ categoria: string }> }) {
  const c = await categoriaPorSlug((await params).categoria);
  if (!c) notFound();
  return (
    <main id="contenido">
      <JsonLd datos={[migas([{ nombre: 'Catálogo', ruta: '/catalogo' }, { nombre: c.nombre, ruta: `/catalogo/${c.slug}` }]), jsonCategoria(c)]} />
      <BannerPagina eyebrow="Categoría" titulo={c.nombre} imagen={c.fotos[0]} producto={c.fotos.length > 0 && c.slug !== 'networking'} migas={[{ texto: 'Catálogo', href: '/catalogo' }]} />
      <Reveal className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        <Hexagono icono={c.icono} tam={72} />
        <p className="mt-4 max-w-2xl text-lg text-carbon/80">{c.resumen}</p>
        {c.marcas.length > 0 && <p className="mt-4 text-sm font-medium text-rojo-hondo">Marcas: {c.marcas.join(' · ')}</p>}
        {c.fotos.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {c.fotos.map((f, n) => (
              <HexImagen key={`${n}-${f}`} src={f} alt={`${c.nombre}, ejemplo ${n + 1}`} sizes="(min-width: 640px) 33vw, 90vw" />
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border border-carbon/20 bg-gris p-6 text-carbon/80">Consulta disponibilidad con nuestro equipo.</p>
        )}
        <BotonHex href={`/cotizar?categoria=${c.slug}`} size="lg" icono={FileText} className="mt-10">
          Cotizar {c.nombre}
        </BotonHex>
      </Reveal>
    </main>
  );
}
