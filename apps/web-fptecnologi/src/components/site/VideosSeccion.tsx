import { MapPin } from 'lucide-react';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { YoutubeIcon } from '@/components/site/icons';
import { VideoYoutube } from '@/components/site/VideoYoutube';
import { VideosSlider } from '@/components/site/VideosSlider';
import { CANAL_URL, type Video } from '@/lib/youtube';

type Encabezado = { badge: string; titulo: string; destacado: string; descripcion: string; botonTexto?: string; botonUrl?: string };

/*
 * Sección de videos de YouTube (Nosotros, al final tras el contacto). Con
 * varios videos se muestran en slider; con uno solo, grande y centrado.
 * Cierra con dos llamados: ver el canal y visitarnos (contacto / ubicación).
 * Sin videos no se muestra nada.
 */
export function VideosSeccion({ c, videos, fondo = 'claro', conVisita = true }: { c: Encabezado; videos: Video[]; fondo?: 'claro' | 'blanco'; conVisita?: boolean }) {
  if (videos.length === 0) return null;
  const canal = c.botonUrl?.trim() || CANAL_URL;
  return (
    <section id="videos" className={`scroll-mt-24 py-20 ${fondo === 'blanco' ? 'bg-white' : ''}`}>
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
          {c.badge && <SectionBadge>{c.badge}</SectionBadge>}
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">{c.titulo}</span> <span className="title-shimmer-light">{c.destacado}</span>
          </h2>
          {c.descripcion && <p className="mt-3 text-ink/60">{c.descripcion}</p>}
        </ScrollReveal>

        <ScrollReveal direction="up">
          {videos.length > 1 ? (
            <VideosSlider videos={videos} />
          ) : (
            <div className="mx-auto max-w-4xl">
              <VideoYoutube id={videos[0].id} titulo={videos[0].titulo} grande />
            </div>
          )}
        </ScrollReveal>

        <ScrollReveal direction="up" className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href={canal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#ff0000] px-5 text-sm font-semibold text-white shadow-lg shadow-black/15 transition-transform hover:-translate-y-0.5"
          >
            <YoutubeIcon className="h-5 w-5" />
            {c.botonTexto?.trim() || 'Ver más en nuestro canal'}
          </a>
          {conVisita && (
            <a
              href="/contacto"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-brand-dark shadow-lg shadow-brand-dark/10 transition-transform hover:-translate-y-0.5 hover:text-brand-primary"
            >
              <MapPin className="h-5 w-5" strokeWidth={2} />
              Visítanos
            </a>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
