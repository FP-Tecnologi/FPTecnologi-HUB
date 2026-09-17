'use client';

import Image from 'next/image';
import { WHY_CHOOSE_US } from '@/lib/content';
import { useRiteflowStagger } from '@/hooks/useRiteflowStagger';

// 4 beneficios reales (WHY_CHOOSE_US) -- la plantilla original tenía 5
// tarjetas con capturas de su producto de IA; acá cada una lleva una foto
// real ya licenciada (Modelo 7/9), tamaño "bento" en vez de grilla pareja.
const IMAGES = ['/images/modelo7/cat-laptops.jpg', '/images/solutions/servidores.jpg', '/images/modelo7/equipo.jpg', '/images/modelo9/hero-office.jpg'];
const SIZES: Array<'lg' | 'md'> = ['lg', 'md', 'md', 'lg'];

export function FeaturesRiteflow() {
  useRiteflowStagger();

  return (
    <section className="border-b border-[#2d3a57] bg-[#0e1422] py-14 md:py-20 lg:py-24 xl:py-[100px]">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12 xl:px-16">
        <div className="mx-auto mb-10 max-w-[600px] text-center sm:mb-16">
          <span className="mb-5 inline-block rounded-[10px] border-[1.5px] border-[#a78bfa] bg-[#222938] px-3 py-1.5 text-sm font-medium text-[#a78bfa]">
            Por qué elegirnos
          </span>
          <h2
            className="text-4xl font-semibold !leading-[1.2] sm:text-[40px] md:text-5xl lg:text-[52px]"
            style={{
              background: 'linear-gradient(180deg, #f8f8f8 62.71%, #7670de 90.4%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Tecnología pensada para tu operación
          </h2>
          <p className="mt-4 text-[#fbfbfb]/80 md:mt-5">
            Distribución autorizada, stock real y un equipo comercial que arma la propuesta a tu medida.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2" data-sttr-wrapper>
          {WHY_CHOOSE_US.map((item, i) => (
            <div key={item.title} data-sttr-card className={SIZES[i] === 'lg' ? 'sm:col-span-2' : ''}>
              <div className="h-full overflow-hidden rounded-2xl border border-[#2d3a57]/70 bg-gradient-to-b from-[#7d76ff]/10 to-[#2f27b1]/10 p-4 sm:p-5">
                <div className={`overflow-hidden rounded-xl border border-[#2d3a57]/70 ${SIZES[i] === 'lg' ? 'aspect-[16/6.8]' : 'aspect-[16/9.3]'}`}>
                  <Image src={IMAGES[i]} alt={item.title} width={699} height={300} className="h-full w-full object-cover" />
                </div>
                <div className="pt-5">
                  <h3 className="text-xl !leading-tight font-medium tracking-[0.2px] text-[#fbfbfb]">{item.title}</h3>
                  <div className="my-4 h-px w-full bg-gradient-to-r from-[#1D2047] via-[#4F46E5] to-[#1C1F46]" />
                  <p className="text-[#fbfbfb]/60">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
