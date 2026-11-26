'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { miniatura } from '@/lib/youtube';

/*
 * Video de YouTube "liviano": muestra la miniatura con un botón de play y
 * solo carga el reproductor (youtube-nocookie) al hacer click. Así la página
 * no descarga ~1 MB de YouTube por cada video que nadie reproduce.
 */
export function VideoYoutube({ id, titulo, className = '', grande = false, autoplay = false }: { id: string; titulo: string; className?: string; grande?: boolean; autoplay?: boolean }) {
  const [activo, setActivo] = useState(autoplay);
  return (
    <div className={`relative aspect-video overflow-hidden rounded-2xl bg-brand-950 shadow-xl shadow-brand-dark/20 ${className}`}>
      {activo ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={titulo || 'Video de FPTecnologi'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setActivo(true)} className="group absolute inset-0 h-full w-full cursor-pointer text-left" aria-label={`Reproducir: ${titulo || 'video'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={miniatura(id)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/20 to-transparent" />
          <span
            className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-brand-primary shadow-2xl shadow-black/40 transition-transform duration-300 group-hover:scale-110 ${
              grande ? 'h-20 w-20' : 'h-14 w-14'
            }`}
          >
            <Play className={`${grande ? 'h-8 w-8' : 'h-6 w-6'} translate-x-0.5 fill-current`} />
          </span>
          {titulo && (
            <span className={`absolute inset-x-4 bottom-4 line-clamp-2 font-display font-bold leading-snug text-white ${grande ? 'text-lg sm:text-xl' : 'text-sm'}`}>{titulo}</span>
          )}
        </button>
      )}
    </div>
  );
}
