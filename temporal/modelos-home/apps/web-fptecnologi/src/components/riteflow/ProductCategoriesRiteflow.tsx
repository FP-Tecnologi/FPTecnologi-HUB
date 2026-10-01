'use client';

import Image from 'next/image';
import { TIENDA_CATEGORIES } from '@/lib/content';
import { useRiteflowStagger } from '@/hooks/useRiteflowStagger';

/* "Categorías de productos" de la estructura final -- las 4 categorías
   reales de la Tienda (TIENDA_CATEGORIES), como tarjetas foto + título en el
   lenguaje visual de Riteflow. */
export function ProductCategoriesRiteflow() {
  useRiteflowStagger();

  return (
    <section className="border-b border-[#2d3a57] bg-[#0e1422] py-14 md:py-20 lg:py-24 xl:py-[100px]">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12 xl:px-16">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-16 sm:flex-row sm:items-end">
          <div>
            <span className="mb-5 inline-block rounded-[10px] border-[1.5px] border-[#2181af] bg-[#1c2a38] px-3 py-1.5 text-sm font-medium text-[#2181af]">
              Tienda
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
              Categorías del catálogo
            </h2>
          </div>
          <a
            href="/tienda"
            className="inline-flex w-fit items-center justify-center rounded-[10px] border-[1.5px] border-[#2181af] bg-[#1c2a38] px-[22px] py-3 text-sm font-medium text-[#2181af] transition-colors hover:bg-[#1c2a38]/70"
          >
            Ver tienda completa
          </a>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-sttr-wrapper>
          {TIENDA_CATEGORIES.map((c) => (
            <a
              key={c.slug}
              href={`/tienda/${c.slug}`}
              data-sttr-card
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-[#2d3a57]/70"
            >
              <Image
                src={c.image}
                alt={c.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className={`${c.imageFit === 'contain' ? 'object-contain bg-white p-6' : 'object-cover'} transition-transform duration-500 group-hover:scale-110`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1422] via-[#0e1422]/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
                <h3 className="text-lg font-medium text-[#fbfbfb]">{c.title}</h3>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-[#2181af] text-[#2181af] transition-transform group-hover:translate-x-0.5">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
