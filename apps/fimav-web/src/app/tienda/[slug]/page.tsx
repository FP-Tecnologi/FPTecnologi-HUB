import { notFound } from 'next/navigation';
import { FileText, MessageCircle } from 'lucide-react';
import BannerPagina from '@/components/BannerPagina';
import BotonHex from '@/components/hex/BotonHex';
import ProductoCard from '@/components/tienda/ProductoCard';
import AgregarCarrito from '@/components/tienda/AgregarCarrito';
import GaleriaProducto from '@/components/tienda/GaleriaProducto';
import Reveal from '@/components/motion/Reveal';
import { getContacto, waUrlDe } from '@/lib/cms';
import { getProductoTienda, getProductosTienda, usd } from '@/lib/tienda';
import { meta } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProductoTienda((await params).slug);
  return p ? meta(p.nombre, `${p.nombre}. Cotiza este equipo con Fimav Perú.`, `/tienda/${p.slug}`) : { title: 'Tienda' };
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProductoTienda((await params).slug);
  if (!p) notFound();
  const [contacto, todos] = await Promise.all([getContacto(), getProductosTienda()]);
  const relacionados = (todos ?? []).filter((x) => x.categoria.slug === p.categoria.slug && x.id !== p.id).slice(0, 4);
  const consulta = encodeURIComponent(`${p.nombre} (código ${p.sku})`);
  const wa = waUrlDe(contacto.whatsapp, `Hola Fimav, quiero cotizar: ${p.nombre} (código ${p.sku}).`);
  const texto = p.descripcion.replace(/\[\/?[a-z_]+[^\]]*\]/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500);
  return (
    <main id="contenido">
      <BannerPagina eyebrow="Tienda" titulo={p.categoria.nombre} migas={[{ texto: 'Tienda', href: '/tienda' }]} />
      <Reveal className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <GaleriaProducto imagenes={p.imagenes} nombre={p.nombre} />
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-rojo-hondo">{p.marca}</p>
            <h2 className="titulo-menor mt-1 text-2xl text-carbon sm:text-3xl">{p.nombre}</h2>
            <p className="mt-1 text-sm text-carbon/70">Código: {p.sku}</p>
            <p className="mt-5 flex items-baseline gap-3 text-carbon">
              <span className="font-display text-3xl font-bold">{usd(p.precio)}</span>
              {p.precioAntes && <s className="text-carbon/60">{usd(p.precioAntes)}</s>}
            </p>
            <p className="mt-1 text-sm text-carbon/70">Precio referencial en dólares, sin IGV. Confirmamos precio y disponibilidad en tu cotización.</p>
            <AgregarCarrito p={p} />
            <div className="mt-4 flex flex-wrap gap-4">
              <BotonHex href={`/cotizar?producto=${consulta}`} size="lg" icono={FileText}>Cotizar este equipo</BotonHex>
              <BotonHex href={wa} variante="contorno" size="lg" icono={MessageCircle}>WhatsApp</BotonHex>
            </div>
            {texto && <p className="mt-8 whitespace-pre-line leading-relaxed text-carbon/90">{texto}</p>}
          </div>
        </div>
        {relacionados.length > 0 && (
          <section aria-labelledby="rel" className="mt-14">
            <h2 id="rel" className="titulo-menor text-2xl text-carbon">También te puede interesar</h2>
            <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{relacionados.map((r) => <li key={r.id} className="flex"><ProductoCard p={r} /></li>)}</ul>
          </section>
        )}
      </Reveal>
    </main>
  );
}
