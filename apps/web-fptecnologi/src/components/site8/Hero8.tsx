import { Instrument_Serif } from 'next/font/google';
import { COTIZADOR_URL } from '@/lib/content';
import { SparkleIcon } from '@/components/site/icons';

/* Fuente de acento (itálica) del headline -- Google Fonts vía next/font,
   nada de la fuente rota de onlinewebfonts.com ni de un WOFF2 propio. */
const accentFont = Instrument_Serif({ subsets: ['latin'], weight: '400', style: 'italic' });

/**
 * Hero de una sola pantalla, inspirado en la estructura/mecánica del spec de
 * Vesper.ai (badge -> h1 en dos líneas con reveal enmascarado -> lede -> 2
 * CTA) pero con copy 100% FPTecnologi: nada de "AI agents"/"workflows" --
 * stock local y distribución autorizada real (ver WHY_CHOOSE_US/content.ts).
 * Fondo: negro con glow radial (definido en page.tsx), sin video ni foto --
 * no hotlinkeamos el mp4 de CloudFront del spec original (no es un asset
 * propio) y un fondo negro puro encaja mejor con el look "metal líquido"
 * que forzar una foto de stock.
 */
export function Hero8() {
  return (
    <main id="top" className="flex flex-1 items-end justify-center px-6 pb-16 pt-2">
      <div className="flex w-full max-w-[860px] flex-col items-center text-center">
        <span
          className="v8-appear v8-appear--pop mb-6 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[12.5px] text-[#f2f2f2]"
          style={{ animationDelay: '220ms', background: 'linear-gradient(90deg, #7d7d7d 0%, #2a2a2a 52%, #0a0a0a 100%)' }}
        >
          <SparkleIcon className="h-4 w-4 text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.45)]" />
          Distribución autorizada B2B
        </span>

        <h1 className="flex flex-col text-[36px] font-medium leading-[1.12] tracking-[-0.045em] text-white sm:text-[48px] lg:text-[56px]">
          <span className="v8-headline-line">
            <span className="v8-appear v8-appear--mask inline-block" style={{ animationDelay: '420ms' }}>
              Equipamiento TI con
            </span>
          </span>
          <span className="v8-headline-line">
            <span className="v8-appear v8-appear--mask inline-block" style={{ animationDelay: '620ms' }}>
              <em className={`${accentFont.className} text-[1.08em] italic text-[#9a9a9a]`}>stock local</em> real.
            </span>
          </span>
        </h1>

        <p
          className="v8-appear v8-appear--soft mt-4 max-w-[470px] text-[15.5px] leading-relaxed text-[#9a9a9a]"
          style={{ animationDelay: '820ms', animationDuration: '1.1s' }}
        >
          Monitores, laptops, servidores y pantallas interactivas con distribución autorizada — cotización sin
          compromiso para tu empresa.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <a
            href={COTIZADOR_URL}
            target="_blank"
            rel="noreferrer"
            className="v8-appear v8-appear--btn flex h-[42px] items-center rounded-md border border-white bg-[linear-gradient(180deg,#ffffff_0%,#e7e7e7_48%,#cfcfcf_100%)] px-[18px] text-[13.5px] font-medium text-[#111] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] transition-shadow duration-300 hover:shadow-[inset_0_1px_0_#fff,0_0_26px_rgba(186,208,255,0.4),0_8px_18px_rgba(255,255,255,0.14)]"
            style={{ animationDelay: '960ms' }}
          >
            Cotizar ahora
          </a>
          <a
            href="/#catalogo"
            className="v8-appear v8-appear--side flex h-[42px] items-center rounded-md border border-white/55 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(0,0,0,0.5)_46%,rgba(150,170,200,0.1))] px-[18px] text-[13.5px] font-medium text-white backdrop-blur-md transition-shadow duration-300 hover:border-white/80 hover:shadow-[0_0_24px_rgba(170,200,255,0.28)]"
            style={{ animationDelay: '1100ms' }}
          >
            Ver catálogo
          </a>
        </div>
      </div>
    </main>
  );
}
