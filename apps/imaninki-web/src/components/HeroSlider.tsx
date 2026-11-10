'use client';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { IconoWhatsApp } from '@/components/WhatsApp';

export type SlideHero = { titulo: string; acento: string; texto: string; lema: string; fotoA: string; fotoB: string; posB?: string };

const INTERVALO = 6500;
// Primera línea en blanco y la segunda en rojo: se separa con «|» o, si no hay, antes de « e » (como «construcción e industria»).
const partes = (a: string) => (a.includes('|') ? a.split('|') : a.split(/ (?=e )/)).map((x) => x.trim());

/** Portada con slides: cambia sola cada pocos segundos, se pausa al pasar el mouse o enfocar, y se puede mover con los puntos. */
export default function HeroSlider({ slides, wa }: { slides: SlideHero[]; wa: string }) {
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);

  useEffect(() => {
    if (pausa || slides.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setI((n) => (n + 1) % slides.length), INTERVALO);
    return () => clearTimeout(t);
  }, [i, pausa, slides.length]);

  return (
    <div className="flex flex-1 flex-col" onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)} onFocus={() => setPausa(true)} onBlur={() => setPausa(false)}>
      <div className="mx-auto flex w-full max-w-7xl flex-[2] flex-col justify-center px-5 pb-6 pt-24 text-center sm:px-8">
        <img fetchPriority="high" decoding="async" src="/brand/marca.svg" alt="Imaninki" width="400" height="100" className="entrada mx-auto h-7 w-auto sm:h-9 lg:h-11" />

        {/* Altura fija según el slide más largo para que no salte la página; los demás se apilan y se funden. */}
        <div className="relative mt-8 grid" aria-live={pausa ? 'polite' : 'off'}>
          {slides.map((s, n) => (
            <div key={s.acento} aria-hidden={n !== i} className={`col-start-1 row-start-1 transition-all duration-700 ${n === i ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>
              <p className="text-lg font-bold uppercase tracking-[0.12em] sm:text-2xl">{s.titulo}</p>
              <h1 className="mt-1 text-[clamp(2rem,6.6vw,4.25rem)] font-black uppercase leading-[0.98] tracking-tight text-rojo-claro [text-shadow:0_4px_30px_rgb(225_29_46/0.35)]">
                <span className="!text-white">{partes(s.acento)[0]}</span>
                {partes(s.acento)[1] && <span className="block">{partes(s.acento)[1]}</span>}
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/85">{s.texto}</p>
              <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-rojo-claro">{s.lema}</p>
            </div>
          ))}
        </div>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="boton inline-flex h-13 items-center gap-2 rounded-md bg-rojo px-7 font-bold uppercase tracking-wide text-white shadow-lg shadow-rojo/30 hover:bg-rojo-hondo">
            <IconoWhatsApp className="icono-sacude size-5" />Cotizar ahora
          </a>
          <a href="#lineas" className="boton inline-flex h-13 items-center gap-2 rounded-md border border-white/35 px-7 font-bold uppercase tracking-wide text-white hover:bg-white hover:text-tinta">
            Ver líneas <ArrowRight aria-hidden="true" size={18} className="icono-avanza" />
          </a>
        </div>

        <div className="mt-7 flex justify-center gap-2" role="group" aria-label="Elegir diapositiva">
          {slides.map((s, n) => (
            <button key={s.acento} type="button" onClick={() => setI(n)} aria-label={`Diapositiva ${n + 1}: ${partes(s.acento).join(' ')}`} aria-current={n === i ? 'true' : undefined} className="grid size-6 place-items-center">
              <span className={`block h-2 rounded-full transition-all duration-300 ${n === i ? 'w-8 bg-rojo-claro' : 'w-2 bg-white/40'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Collage diagonal con filetes plata y rojo: las fotos cambian con cada slide. */}
      <div className="collage relative mt-2 min-h-[9rem] flex-1 sm:min-h-[11rem]" aria-hidden="true">
        {slides.map((s, n) => (
          <div key={s.fotoA} className={`absolute inset-0 transition-opacity duration-1000 ${n === i ? 'opacity-100' : 'opacity-0'}`}>
            <img loading={n === 0 ? 'eager' : 'lazy'} decoding="async" src={s.fotoA} alt="" className="foto-a absolute inset-0 size-full object-cover" />
            <img loading={n === 0 ? 'eager' : 'lazy'} decoding="async" src={s.fotoB} alt="" className={`foto-b absolute inset-0 size-full object-cover ${s.posB ?? ''}`} />
          </div>
        ))}
        <div className="filete-r rojo-filete" />
        <div className="filete-p metal" />
      </div>
    </div>
  );
}
