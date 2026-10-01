'use client';

import Image from 'next/image';
import { STATS } from '@/lib/content';
import { AboutStatCardRiteflow } from './AboutStatCardRiteflow';
import { useRiteflowReveal } from '@/hooks/useRiteflowReveal';

/* Portado de AboutSection.tsx variante "two" (tarjetas de estadísticas) --
   el original tenía un video demo de su producto de IA; acá una foto real
   (ya licenciada en el Modelo 7) y las 3 métricas reales de STATS en vez de
   "700+ reseñas / 10K usuarios / 452K tareas" inventadas. */
export function AboutRiteflow() {
  useRiteflowReveal('[data-container="riteflow-about"]', [
    '[data-thumbnail]',
    '[data-title]',
    '[data-excerpt]',
    '[data-lists]',
    '[data-button]',
  ]);

  return (
    <section className="border-b border-[#2d3a57] bg-[#0e1422] py-14 md:py-20 lg:py-24 xl:py-[100px]" data-container="riteflow-about">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12 xl:px-16">
        <div className="flex flex-col justify-between gap-8 sm:gap-10 md:flex-row">
          <div data-thumbnail className="relative w-full overflow-hidden rounded-2xl md:max-w-[560px]">
            <Image
              src="/images/modelo7/equipo.jpg"
              alt="Equipo comercial FPTecnologi en reunión"
              width={560}
              height={420}
              className="h-full min-h-[300px] w-full object-cover"
            />
          </div>

          <div className="w-full md:max-w-[575px] md:py-5">
            <h2
              data-title
              className="text-3xl font-semibold !leading-[1.2] tracking-[-0.4px] sm:text-4xl lg:text-5xl xl:text-[51px]"
              style={{
                background: 'linear-gradient(180deg, #f8f8f8 62.71%, #2181af 90.4%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Equipamiento TI con distribución autorizada
            </h2>
            <p data-excerpt className="mt-4 tracking-[0.1px] text-[#fbfbfb]/80 md:mt-5">
              Stock local de las principales marcas del mercado, cotización sin compromiso y un especialista que arma
              la propuesta a medida de tu operación.
            </p>

            <div className="my-5 h-px w-full bg-gradient-to-r from-[#0f1b2e] via-[#2181af] to-[#0d1622] lg:my-9" />

            <div className="grid grid-cols-3 gap-3 sm:gap-5">
              {STATS.map((s, i) => (
                <div key={s.label} data-lists>
                  <AboutStatCardRiteflow value={s.value} suffix={s.suffix || undefined} label={s.label} delay={i * 120} />
                </div>
              ))}
            </div>

            <div className="my-5 h-px w-full bg-gradient-to-r from-[#0f1b2e] via-[#2181af] to-[#0d1622] lg:my-9" />

            <div data-button>
              <a
                href="#catalogo"
                className="inline-flex items-center justify-center rounded-[10px] px-[22px] py-3 text-sm font-medium text-white"
                style={{ background: 'linear-gradient(to bottom, #18778b 0%, #155382 51%, #18778b 100%)' }}
              >
                Ver catálogo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
