'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { VideoYoutube } from '@/components/site/VideoYoutube';
import { miniatura, type Video } from '@/lib/youtube';

/*
 * Visor de videos: reproductor grande arriba y, debajo, las miniaturas en un
 * slider (2 por vista en móvil, 3 en tablet, 4 en escritorio) con flechas.
 * Click en una miniatura = se reproduce en el visor grande.
 */
export function VideosSlider({ videos }: { videos: Video[] }) {
  const [sel, setSel] = useState(0);
  const [reproducir, setReproducir] = useState(false);
  const pista = useRef<HTMLDivElement>(null);
  const [bordes, setBordes] = useState({ inicio: true, fin: false });

  const leer = useCallback(() => {
    const el = pista.current;
    if (!el) return;
    setBordes({ inicio: el.scrollLeft < 8, fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    leer();
    window.addEventListener('resize', leer);
    return () => window.removeEventListener('resize', leer);
  }, [leer]);

  const mover = (dir: number) => {
    const el = pista.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: 'smooth' });
  };

  const elegir = (i: number) => {
    setSel(i);
    setReproducir(true);
    const item = pista.current?.children[i] as HTMLElement | undefined;
    item?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  };

  const v = videos[sel];
  const flecha =
    'absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-dark shadow-lg shadow-brand-dark/20 transition hover:bg-brand-primary hover:text-white disabled:pointer-events-none disabled:opacity-0';

  return (
    <div className="mx-auto max-w-5xl">
      {/* key: al cambiar de video se monta de nuevo el reproductor (y arranca solo si vino de un click). */}
      <VideoYoutube key={v.id} id={v.id} titulo={v.titulo} grande autoplay={reproducir} />

      <div className="relative mt-5">
        <button type="button" className={`${flecha} -left-3`} onClick={() => mover(-1)} disabled={bordes.inicio} aria-label="Ver videos anteriores">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div ref={pista} onScroll={leer} className="flex snap-x gap-4 overflow-x-auto scroll-smooth py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {videos.map((x, i) => {
            const on = i === sel;
            return (
              <button
                key={x.id}
                type="button"
                onClick={() => elegir(i)}
                aria-current={on}
                aria-label={`Ver: ${x.titulo || `video ${i + 1}`}`}
                className="group w-[calc((100%-1rem)/2)] shrink-0 snap-start text-left sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]"
              >
                <span className={`relative block aspect-video overflow-hidden rounded-xl ring-2 transition ${on ? 'ring-brand-primary' : 'ring-transparent group-hover:ring-brand-primary/40'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={miniatura(x.id)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className={`absolute inset-0 flex items-center justify-center transition ${on ? 'bg-brand-950/50' : 'bg-brand-950/20 group-hover:bg-brand-950/35'}`}>
                    {on ? (
                      <span className="rounded-md bg-brand-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">Viendo</span>
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-primary">
                        <Play className="h-4 w-4 translate-x-px fill-current" />
                      </span>
                    )}
                  </span>
                </span>
                {x.titulo && <span className={`mt-2 line-clamp-2 text-sm font-semibold leading-snug ${on ? 'text-brand-primary' : 'text-ink/80'}`}>{x.titulo}</span>}
              </button>
            );
          })}
        </div>
        <button type="button" className={`${flecha} -right-3`} onClick={() => mover(1)} disabled={bordes.fin} aria-label="Ver más videos">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
