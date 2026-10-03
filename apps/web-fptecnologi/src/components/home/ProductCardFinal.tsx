'use client';

import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, GitCompareArrows, Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { ClickConfirmButton } from './ClickConfirmButton';
import { useCurrency } from '@/context/CurrencyContext';
import { ProductGalleryModal } from './ProductGalleryModal';
import { brandSlug } from '@/lib/content';
import { discountOf, productHref, type ShopProduct } from '@/lib/catalog';

type Product = ShopProduct;

/**
 * Tarjeta de producto final -- base "4.2 estilo Vireo" de guia-estilos
 * (imagen + badge de stock + botón de carrito solo-ícono), con zoom de
 * imagen al hover, "comparar", "favorito" y galería (ProductGalleryModal).
 *
 * Las fotos del catálogo son PNG con fondo blanco pegado: `mix-blend-multiply`
 * hace que ese blanco desaparezca sobre el fondo claro del área de imagen,
 * así el producto queda "recortado" sin editar los archivos.
 * Botones con esquinas suaves (rounded-lg), no circulares, en colores de
 * marca; íconos de lucide-react.
 */
export function ProductCardFinal({
  product,
  compared,
  onToggleCompare,
}: {
  product: Product;
  compared: boolean;
  onToggleCompare: (sku: string) => void;
}) {
  const { addItem } = useCart();
  const { format } = useCurrency();
  const { isFavorite, toggle } = useFavorites();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const favorite = isFavorite(product.sku);
  const images: readonly string[] = product.images;
  const [active, setActive] = useState(0);
  const go = (d: number) => setActive((i) => (i + d + images.length) % images.length);

  const discount = discountOf(product);
  // El chip del ícono solo toma su fondo al hover/sweep (rotated): en reposo
  // es transparente, así no parece un botón dentro de otro.
  const cartIcon = (rotated: boolean) => (
    <span className={`flex items-center justify-center rounded-md p-1.5 transition-colors duration-300 ${rotated ? 'bg-white/20' : 'bg-transparent'}`}>
      <ShoppingCart className={`h-4 w-4 transition-transform duration-300 ${rotated ? '-rotate-12' : ''}`} strokeWidth={2} />
    </span>
  );

  const iconBtn = (active: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-lg shadow-sm shadow-brand-dark/15 transition-colors ${
      active ? 'bg-brand-primary text-white' : 'bg-white text-brand-dark hover:bg-brand-dark hover:text-white'
    }`;

  return (
    <>
      <div className="group h-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-lg shadow-brand-dark/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-dark/25">
        {/* Fondo celeste suave (azul bajo); el blanco de las fotos se funde
            con mix-blend-multiply. */}
        <div className="relative aspect-square overflow-hidden bg-producto">
          {discount > 0 && (
            <span className="absolute left-3 top-3 z-10 rounded-md bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">-{discount}%</span>
          )}

          {/* Comparar + favorito, apilados en la esquina superior derecha. */}
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => toggle({ sku: product.sku, name: product.name, brand: product.brand, price: product.price, priceBefore: product.priceBefore, image: images[0] })}
              aria-pressed={favorite}
              aria-label={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              className={iconBtn(favorite)}
            >
              <Heart className="h-4 w-4" strokeWidth={2} fill={favorite ? 'currentColor' : 'none'} />
            </button>
            <button
              type="button"
              onClick={() => onToggleCompare(product.sku)}
              aria-pressed={compared}
              aria-label={compared ? 'Quitar de comparar' : 'Agregar a comparar'}
              className={iconBtn(compared)}
            >
              <GitCompareArrows className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <button type="button" onClick={() => setGalleryOpen(true)} aria-label="Ver galería" className="block h-full w-full cursor-zoom-in">
            <img
              src={images[active]}
              alt={product.name}
              className="h-full w-full object-contain p-8 mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
            />
          </button>

          {/* Galería (4.4): flechas al hover, solo si hay más de 1 foto. */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Foto anterior"
                className="absolute left-3 top-[68%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-white/90 text-brand-dark opacity-0 pointer-events-none group-hover:pointer-events-auto shadow-sm shadow-brand-dark/15 transition-opacity hover:bg-white group-hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Foto siguiente"
                className="absolute right-3 top-[68%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-white/90 text-brand-dark opacity-0 pointer-events-none group-hover:pointer-events-auto shadow-sm shadow-brand-dark/15 transition-opacity hover:bg-white group-hover:opacity-100"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </>
          )}

          {/* Marca como etiqueta de vidrio sobre la foto; lleva a los
              productos de esa marca. */}
          <a
            href={`/marcas/${brandSlug(product.brand)}`}
            aria-label={`Ver productos ${product.brand}`}
            className="absolute bottom-3 left-3 z-10 rounded-md border border-white/60 bg-white/40 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-dark shadow-sm shadow-brand-dark/10 backdrop-blur-md transition-colors hover:bg-brand-dark hover:text-white"
          >
            {product.brand}
          </a>
        </div>

        {/* Tira de miniaturas (4.4). Siempre visible, también con 1 sola
            foto, para que todas las tarjetas tengan la misma altura. */}
        <div className="flex gap-2 border-b border-black/5 px-4 py-3">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`h-11 w-11 shrink-0 overflow-hidden rounded-lg border-2 bg-producto transition-colors ${
                active === i ? 'border-brand-primary' : 'border-transparent hover:border-brand-primary/40'
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-contain p-1 mix-blend-multiply" />
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5 p-4">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-ink">
            <a href={productHref(product.sku, product.slug)} className="transition-colors hover:text-brand-700">
              {product.name}
            </a>
          </h3>
          <div className="mt-0.5 flex items-baseline gap-2 font-mono">
            <span className="text-base font-bold text-ink">{format(product.price)}</span>
            {discount > 0 && <span className="text-xs text-ink/40 line-through">{format(product.priceBefore!)}</span>}
          </div>
          <div className="mt-2 flex items-center justify-between">
            {/* Mismo alto que el botón del carrito (h-10). */}
            <span className="flex h-10 items-center rounded-lg bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-600">En stock</span>
            {/* Solo ícono en reposo; al hover se despliega "Añadir al
                carrito", y al click hace el mismo sweep que "Ver catálogo"
                antes de agregar y mostrar "Agregado". */}
            <ClickConfirmButton
              collapsed
              icon={cartIcon}
              label="Añadir al carrito"
              doneIcon={() => (
                <span className="flex items-center justify-center rounded-md bg-white/20 p-1.5">
                  <Check className="h-4 w-4" strokeWidth={2.4} />
                </span>
              )}
              doneLabel="Agregado"
              onConfirm={() => addItem({ sku: product.sku, name: product.name, price: product.price, image: images[0] })}
              className="h-10 shrink-0 rounded-lg bg-brand-primary px-1.5 text-xs font-semibold text-white hover:bg-brand-primary hover:pr-3"
              doneClassName="h-10 shrink-0 rounded-lg bg-emerald-500 px-1.5 pr-3 text-xs font-semibold text-white"
            />
          </div>
        </div>
      </div>

      {galleryOpen && <ProductGalleryModal name={product.name} images={[...images]} initial={active} onClose={() => setGalleryOpen(false)} />}
    </>
  );
}
