'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import { FEATURED_PRODUCTS } from '@/lib/content';
import { useCart } from '@/context/CartContext';

const MAX_COMPARE = 3;

/* "Productos destacados" de la estructura final -- carrusel lateral (swiper,
   ya instalado para el preview verbatim de Riteflow) con Añadir al carrito
   (useCart real, ver AboutRiteflow/Contact) + Comparar: hasta 3 productos a
   la vez, tabla comparativa simple debajo con los campos reales que ya
   tenemos (marca, precio, SKU) -- no se inventan specs que no están en
   FEATURED_PRODUCTS. */
export function FeaturedProductsRiteflow() {
  const { addItem, justAddedSku } = useCart();
  const [compareSkus, setCompareSkus] = useState<string[]>([]);

  const toggleCompare = (sku: string) => {
    setCompareSkus((prev) =>
      prev.includes(sku) ? prev.filter((s) => s !== sku) : prev.length < MAX_COMPARE ? [...prev, sku] : prev
    );
  };

  const compareProducts = FEATURED_PRODUCTS.filter((p) => compareSkus.includes(p.sku));

  return (
    <section id="catalogo" className="border-b border-[#2d3a57] bg-[#0e1422] py-14 md:py-20 lg:py-24 xl:py-[100px]">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12 xl:px-16">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-16 sm:flex-row sm:items-end">
          <div>
            <span className="mb-5 inline-block rounded-[10px] border-[1.5px] border-[#2181af] bg-[#1c2a38] px-3 py-1.5 text-sm font-medium text-[#2181af]">
              Productos destacados
            </span>
            <h2
              className="text-4xl font-semibold !leading-[1.2] sm:text-[40px] md:text-5xl"
              style={{
                background: 'linear-gradient(180deg, #f8f8f8 62.71%, #2181af 90.4%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Los más vendidos
            </h2>
          </div>
          <p className="max-w-sm text-[#fbfbfb]/70">
            Marcá el check de &quot;Comparar&quot; en hasta {MAX_COMPARE} productos para verlos lado a lado.
          </p>
        </div>

        <div className="relative">
          <Swiper
            modules={[Navigation]}
            navigation={{ nextEl: '.fp-rf-next', prevEl: '.fp-rf-prev' }}
            spaceBetween={20}
            slidesPerView={1.15}
            breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3.2 }, 1280: { slidesPerView: 4 } }}
            className="!overflow-visible"
          >
            {FEATURED_PRODUCTS.map((p) => {
              const discount = Math.round(((p.priceBefore - p.price) / p.priceBefore) * 100);
              const justAdded = justAddedSku === p.sku;
              const inCompare = compareSkus.includes(p.sku);
              return (
                <SwiperSlide key={p.sku}>
                  <div className="flex h-full flex-col rounded-2xl border border-[#2d3a57]/70 bg-gradient-to-b from-[#18778b]/10 to-[#155382]/10 p-4">
                    <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-xl border border-[#2d3a57]/70 bg-white p-4">
                      <span className="absolute left-2 top-2 z-10 rounded-full bg-[#2181af] px-2.5 py-1 text-[11px] font-bold text-[#0e1422]">
                        -{discount}%
                      </span>
                      <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
                    </div>

                    <div className="pt-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-[#2181af]">{p.brand}</p>
                      <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-[#fbfbfb]">{p.name}</h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-lg font-semibold text-[#fbfbfb]">${p.price.toFixed(2)}</span>
                        <span className="text-sm text-[#fbfbfb]/40 line-through">${p.priceBefore.toFixed(2)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => addItem({ sku: p.sku, name: p.name, price: p.price, image: p.image })}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-medium text-white transition-colors"
                        style={
                          justAdded
                            ? { background: '#10b981' }
                            : { background: 'linear-gradient(to bottom, #18778b 0%, #155382 51%, #18778b 100%)' }
                        }
                      >
                        {justAdded ? 'Agregado' : 'Añadir al carrito'}
                      </button>

                      <label className="mt-3 flex items-center gap-2 text-sm text-[#fbfbfb]/70">
                        <input
                          type="checkbox"
                          checked={inCompare}
                          disabled={!inCompare && compareSkus.length >= MAX_COMPARE}
                          onChange={() => toggleCompare(p.sku)}
                          className="h-4 w-4 rounded border-[#2d3a57] accent-[#2181af]"
                        />
                        Comparar
                      </label>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              className="fp-rf-prev flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-[#2181af] text-[#2181af] transition-colors hover:bg-[#1c2a38]"
              aria-label="Anterior"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button
              type="button"
              className="fp-rf-next flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-[#2181af] text-[#2181af] transition-colors hover:bg-[#1c2a38]"
              aria-label="Siguiente"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>

        {compareProducts.length >= 2 && (
          <div className="mt-10 overflow-x-auto rounded-2xl border border-[#2d3a57]/70">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#2d3a57]/70 text-[#fbfbfb]/50">
                  <th className="p-4 font-medium">Producto</th>
                  {compareProducts.map((p) => (
                    <th key={p.sku} className="p-4 font-medium text-[#fbfbfb]">{p.brand}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[#fbfbfb]/80">
                <tr className="border-b border-[#2d3a57]/40">
                  <td className="p-4 text-[#fbfbfb]/50">Modelo</td>
                  {compareProducts.map((p) => <td key={p.sku} className="p-4">{p.name}</td>)}
                </tr>
                <tr className="border-b border-[#2d3a57]/40">
                  <td className="p-4 text-[#fbfbfb]/50">SKU</td>
                  {compareProducts.map((p) => <td key={p.sku} className="p-4">{p.sku}</td>)}
                </tr>
                <tr>
                  <td className="p-4 text-[#fbfbfb]/50">Precio</td>
                  {compareProducts.map((p) => <td key={p.sku} className="p-4 font-semibold text-[#fbfbfb]">${p.price.toFixed(2)}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
