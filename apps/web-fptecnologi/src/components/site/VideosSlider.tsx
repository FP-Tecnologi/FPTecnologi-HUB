'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoYoutube } from '@/components/site/VideoYoutube';
import type { Video } from '@/lib/youtube';

/*
 * Slider de videos: carrusel con scroll-snap (1 por vista en móvil, 2 en
 * tablet, 3 en escritorio), flechas y puntos. Se puede deslizar con el dedo
 * o la rueda del mouse; las flechas avanzan de a una tarjeta.
 */
export function VideosSlider({ videos }: { videos: Video[] }) {
  const pista = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);
  const [bordes, setBordes] = useState({ inicio: true, fin: false });

  const leer = useCallback(() => {
    const el = pista.current;
    if (!el) return;
    const paso = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
    setActual(Math.round(el.scrollLeft / (paso + 24)));
    setBordes({ inicio: el.scrollLeft < 8, fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    leer();
    window.addEventListener('resize', leer);
    return () => window.removeEventListener('resize', leer);
  }, [leer]);

  const ir = (i: number) => {
    const el = pista.current;
    const item = el?.children[Math.max(0, Math.min(videos.length - 1, i))] as HTMLElement | undefined;
    if (el && item) el.scrollTo({ left: item.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  };

  const flecha =
    'absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-dark shadow-xl shadow-brand-dark/20 transition hover:bg-brand-primary hover:text-white disabled:pointer-events-none disabled:opacity-0 md:flex';

  return (
    <div className="relative">
      <button type="button" className={`${flecha} -left-5`} onClick={() => ir(actual - 1)} disabled={bordes.inicio} aria-label="Video anterior">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <div
        ref={pista}
        onScroll={leer}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carrusel"
      >
        {videos.map((v, i) => (
          <div key={v.id} className="w-full shrink-0 snap-start md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]" aria-label={`Video ${i + 1} de ${videos.length}`}>
            <VideoYoutube id={v.id} titulo={v.titulo} />
          </div>
        ))}
      </div>
      <button type="button" className={`${flecha} -right-5`} onClick={() => ir(actual + 1)} disabled={bordes.fin} aria-label="Video siguiente">
        <ChevronRight className="h-6 w-6" />
      </button>
      <div className="mt-6 flex justify-center gap-2">
        {videos.map((v, i) => (
          <button
            key={v.id}
            type="button"
            onClick={() => ir(i)}
            aria-label={`Ir al video ${i + 1}`}
            aria-current={i === actual}
            className={`h-2 rounded-full transition-all ${i === actual ? 'w-8 bg-brand-primary' : 'w-2 bg-brand-primary/25 hover:bg-brand-primary/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
