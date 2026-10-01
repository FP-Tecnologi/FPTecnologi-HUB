'use client';

import type { CatalogProduct } from '@/lib/catalog';
import { ProductCardFinal } from '@/components/home/ProductCardFinal';
import { CompareDock, useCompare } from '@/components/home/CompareDock';

/* Grilla de tarjetas de producto con comparador (para /marcas/[slug]). */
export function ProductGrid({ products }: { products: CatalogProduct[] }) {
  const compare = useCompare();
  return (
    <>
      <div className="grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCardFinal key={p.sku} product={p} compared={compare.skus.includes(p.sku)} onToggleCompare={compare.toggle} />
        ))}
      </div>
      <CompareDock products={products} compare={compare} />
    </>
  );
}
