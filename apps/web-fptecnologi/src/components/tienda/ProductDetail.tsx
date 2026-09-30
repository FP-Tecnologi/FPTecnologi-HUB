'use client';

import { useState } from 'react';
import { BadgeCheck, Check, ChevronLeft, ChevronRight, Heart, PackageCheck, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useFavorites } from '@/context/FavoritesContext';
import { brandSlug, COTIZADOR_URL, TIENDA_CATEGORIES } from '@/lib/content';
import { discountOf, type CatalogProduct } from '@/lib/catalog';
import { whatsappHref } from '@/lib/chatActions';
import { ClickConfirmButton } from '@/components/home/ClickConfirmButton';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { ProductCardFinal } from '@/components/home/ProductCardFinal';
import { CompareDock, useCompare } from '@/components/home/CompareDock';
import { ProductGalleryModal } from '@/components/home/ProductGalleryModal';
import { SectionBadge } from '@/components/home/SectionBadge';
import { WhatsAppIcon } from '@/components/site/icons';

/*
 * Ficha de producto: galería (miniaturas + flechas + zoom), marca, nombre,
 * precio en la moneda elegida (sin IGV), stock, carrito, cotizar/WhatsApp,
 * características (del nombre del catálogo) y productos de la misma categoría.
 * Mismo lenguaje que la tarjeta de producto y la tienda (DESIGN.md).
 */
const GARANTIAS = [
  { icon: ShieldCheck, t: 'Garantía oficial de la marca' },
  { icon: PackageCheck, t: 'Stock local, despacho inmediato' },
  { icon: Truck, t: 'Envío a todo el Perú' },
  { icon: BadgeCheck, t: 'Distribuidor autorizado' },
];

export function ProductDetail({ product, relacionados }: { product: CatalogProduct; relacionados: CatalogProduct[] }) {
  const { addItem } = useCart();
  const { format, currency } = useCurrency();
  const { isFavorite, toggle } = useFavorites();
  const compare = useCompare();
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const images = product.images;
  const discount = discountOf(product);
  const categoria = TIENDA_CATEGORIES.find((c) => c.slug === product.category);
  const fav = isFavorite(product.sku);
  // Características = las partes del nombre separadas por comas (datos reales del catálogo).
  const partes = product.name.split(/,\s*/);
  const caracteristicas = partes.length > 1 ? partes.slice(1) : [];

  const go = (d: number) => setActive((i) => (i + d + images.length) % images.length);

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Galería */}
          <div>
            <div className="group relative aspect-square overflow-hidden rounded-2xl bg-brand-primary/8 shadow-lg shadow-brand-dark/10">
              {discount > 0 && <span className="absolute left-4 top-4 z-10 rounded-md bg-red-500 px-2.5 py-1 text-xs font-bold text-white">-{discount}%</span>}
              <button type="button" onClick={() => setZoom(true)} aria-label="Ampliar foto" className="block h-full w-full cursor-zoom-in">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[active]} alt={product.name} className="h-full w-full object-contain p-12 mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
              </button>
              {images.length > 1 && (
                <>
                  <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-white/90 text-brand-dark shadow-md shadow-brand-dark/15 hover:bg-white">
                    <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-white/90 text-brand-dark shadow-md shadow-brand-dark/15 hover:bg-white">
                    <ChevronRight className="h-5 w-5" strokeWidth={2.2} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Foto ${i + 1}`}
                    className={`h-20 w-20 overflow-hidden rounded-xl bg-brand-primary/8 p-2 transition-all ${i === active ? 'ring-2 ring-brand-primary' : 'opacity-70 hover:opacity-100'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información */}
          <div>
            <a href={`/marcas/${brandSlug(product.brand)}`} className="inline-flex rounded-md bg-brand-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-brand-primary hover:bg-brand-primary hover:text-white">
              {product.brand}
            </a>
            <h1 className="mt-3 font-display text-2xl font-bold leading-snug text-ink sm:text-3xl">{partes[0]}</h1>
            <p className="mt-2 text-sm text-ink/50">SKU: {product.sku}</p>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className="font-display text-4xl font-bold text-ink">{format(product.price)}</span>
              {discount > 0 && <span className="pb-1 text-lg text-ink/40 line-through">{format(product.priceBefore!)}</span>}
              {discount > 0 && <span className="mb-1.5 rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-600">Ahorras {discount}%</span>}
            </div>
            <p className="mt-1 text-xs text-ink/50">Precio en {currency === 'PEN' ? 'soles' : 'dólares'} sin IGV. El IGV (18%) se suma en el carrito.</p>

            <span className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> En stock
            </span>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ClickConfirmButton
                icon={(r) => <ShoppingCart className={`h-4 w-4 transition-transform duration-300 ${r ? '-rotate-12' : ''}`} strokeWidth={2} />}
                label="Añadir al carrito"
                doneIcon={() => <Check className="h-4 w-4" strokeWidth={2.4} />}
                doneLabel="Agregado"
                onConfirm={() => addItem({ sku: product.sku, name: product.name, price: product.price, image: images[0] })}
                className="h-12 rounded-xl bg-brand-dark px-6 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-dark/30 hover:bg-brand-primary"
                doneClassName="h-12 rounded-xl bg-emerald-500 px-6 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/30"
              />
              <button
                type="button"
                onClick={() => toggle({ sku: product.sku, name: product.name, brand: product.brand, price: product.price, priceBefore: product.priceBefore, image: images[0] })}
                aria-pressed={fav}
                className={`flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors ${fav ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-dark/15 bg-white text-brand-dark hover:border-brand-primary'}`}
              >
                <Heart className="h-4 w-4" strokeWidth={2} fill={fav ? 'currentColor' : 'none'} />
                {fav ? 'En favoritos' : 'Favorito'}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <MoreInfoButton href={COTIZADOR_URL} label="Cotizar por volumen" />
              <a
                href={whatsappHref(`Hola, quiero información del producto ${product.name} (SKU ${product.sku})`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-whatsapp px-4 text-sm font-semibold text-white shadow-md shadow-whatsapp/30 transition-colors hover:bg-whatsapp-dark md:h-11"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Consultar por WhatsApp
              </a>
            </div>

            {caracteristicas.length > 0 && (
              <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg shadow-brand-dark/10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink">
                  Características
                  <span className="mt-2 block h-0.5 w-8 rounded-full bg-brand-primary" />
                </p>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {caracteristicas.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-ink/70">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" strokeWidth={2.4} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {GARANTIAS.map(({ icon: Icon, t }) => (
                <li key={t} className="flex items-center gap-3 text-sm font-medium text-ink/70">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-dark text-white shadow-md shadow-brand-dark/25">
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {relacionados.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <SectionBadge>{categoria?.title ?? 'Tienda'}</SectionBadge>
                <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                  <span className="text-ink">También te</span> <span className="title-shimmer-light">puede interesar</span>
                </h2>
              </div>
              <MoreInfoButton href={categoria ? `/tienda/${categoria.slug}` : '/tienda'} label={`Ver ${categoria?.title.toLowerCase() ?? 'tienda'}`} />
            </div>
            <div className="grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4">
              {relacionados.map((p) => (
                <ProductCardFinal key={p.sku} product={p} compared={compare.skus.includes(p.sku)} onToggleCompare={compare.toggle} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CompareDock products={relacionados} compare={compare} />
      {zoom && <ProductGalleryModal name={product.name} images={[...images]} initial={active} onClose={() => setZoom(false)} />}
    </>
  );
}
