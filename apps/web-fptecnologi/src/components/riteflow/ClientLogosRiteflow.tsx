'use client';

import Image from 'next/image';
import { PARTNER_BRANDS } from '@/lib/content';
import { useRiteflowStagger } from '@/hooks/useRiteflowStagger';

export function ClientLogosRiteflow() {
  useRiteflowStagger();

  return (
    <section className="border-b border-[#2d3a57] bg-[#0e1422] py-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12 xl:px-16">
        <p className="text-center text-sm uppercase tracking-wide text-[#fbfbfb]/50">
          Distribución autorizada de las principales marcas
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4" data-sttr-wrapper>
          {PARTNER_BRANDS.map((b) => (
            <div key={b.name} data-sttr-card className="rounded-md bg-white/90 px-3 py-2 opacity-80 transition-opacity hover:opacity-100">
              <Image src={b.logo} alt={b.name} width={110} height={32} className="h-6 w-auto object-contain sm:h-7" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
