'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PARTNER_BRANDS, brandSlug } from '@/lib/content';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';

export function BrandMarquee({ showLabel = true }: { showLabel?: boolean }) {
  // 3 copias (antes 2) -- con solo 13 marcas, duplicar una vez hace que la
  // tanda completa se repita cada 28s (la duración de la animación), muy
  // notorio ("se corta/termina"). Con 3 copias el bucle sigue siendo
  // perfecto (translateX -33.33%, un tercio del ancho total) pero hay más
  // contenido de sobra en pantallas anchas antes de que se note la
  // repetición.
  const track = [...PARTNER_BRANDS, ...PARTNER_BRANDS, ...PARTNER_BRANDS];
  const [paused, setPaused] = useState(false);

  return (
    // bg-paper (antes bg-white) -- mismo fondo que la sección de Nosotros,
    // para que no se sienta como un bloque blanco puro distinto del resto.
    <section id="marcas" className="bg-paper py-3">
      {showLabel && (
        <div className="mx-auto mb-8 flex max-w-4xl flex-col items-center px-6 text-center">
          <SectionBadge>Distribución autorizada</SectionBadge>
          <h2 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl">
            <span className="text-ink">Las principales marcas,</span> <span className="title-shimmer-light">con respaldo oficial</span>
          </h2>
          <p className="mt-3 text-ink/65">Equipos originales con garantía de fabricante y soporte local.</p>
        </div>
      )}
      {/* Entrada/salida con el scroll (fade + subida), igual que Nosotros. */}
      <ScrollReveal direction="up">
      <div className="relative overflow-hidden pb-6 pt-3">
        {/* Degradé de borde más ancho (w-24 -> w-36) -- con logos que ahora
            crecen al hover, un degradé angosto hacía que se sintieran
            "cortados" justo al entrar/salir por los costados. from-paper
            (antes from-white) para que combine con el nuevo fondo. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-36 bg-gradient-to-r from-paper to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-36 bg-gradient-to-l from-paper to-transparent" />
        {/* Pausa al hover -- antes era un selector CSS (:has(*:hover)) que no
            pausaba de forma confiable; onMouseEnter/Leave sobre el track
            completo es más directo: apenas el cursor entra a la fila (sobre
            cualquier logo), se pausa. */}
        <div
          className="animate-marquee flex w-max items-center gap-2"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {track.map((brand, i) => (
            <a
              key={`${brand.name}-${i}`}
              href={`/marcas/${brandSlug(brand.name)}`}
              aria-label={`Ver productos ${brand.name}`}
              // La caja (h-32 w-32) ya NO se agranda -- solo el logo de
              // adentro (ver <Image>). `overflow-hidden` acá para que el
              // zoom del logo quede contenido dentro del cuadrado, no
              // desbordando sobre los logos vecinos (el gap ahora es chico,
              // gap-2). El fondo blanco solo aparece al hover -- en reposo
              // queda transparente (se ve el bg-paper de la sección),
              // igual que el sombra/contorno de la caja.
              className="group relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-transparent p-6 transition-[background-color,box-shadow] duration-500 ease-out hover:bg-white hover:shadow-[0_10px_28px_-6px_rgba(33,129,175,0.55)] hover:ring-1 hover:ring-brand-primary/30"
            >
              {/* Tamaño fijo (84x52, antes 72x44 -- un poco más grande). En
                  reposo se ve una silueta sólida en azul oscuro de marca
                  (brand-dark), no gris -- se logra con `mask-image` usando
                  el propio logo (con fondo transparente) como máscara sobre
                  un bloque de color, en vez de un filtro grayscale
                  aproximado. Al hover esa silueta se desvanece y aparece el
                  logo real a color (crossfade de opacidad), ambos ocupando
                  el mismo lugar dentro de este contenedor relative. */}
              <div className="relative h-[52px] w-[84px] transition-transform duration-500 ease-out group-hover:scale-[1.35]">
                <span
                  aria-hidden
                  className="absolute inset-0 bg-brand-primary opacity-100 transition-opacity duration-500 ease-out group-hover:opacity-0"
                  style={{
                    WebkitMaskImage: `url(${brand.maskLogo ?? brand.logo})`,
                    maskImage: `url(${brand.maskLogo ?? brand.logo})`,
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                  }}
                />
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  sizes="84px"
                  className="object-contain opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
      </ScrollReveal>
    </section>
  );
}
