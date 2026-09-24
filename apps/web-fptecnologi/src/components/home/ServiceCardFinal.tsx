'use client';

import Image from 'next/image';
import { Icon } from './Icon';
import { MoreInfoButton } from './MoreInfoButton';
import type { SOLUTIONS } from '@/lib/content';

/**
 * Tarjeta de servicio final -- diseño "Modelo 1" de la guía de estilos
 * (site/Solutions.tsx): vertical 4:5, foto a sangre con degradé oscuro,
 * ícono en chip de vidrio y zoom de la foto al hover. Cambios pedidos:
 * label fijo "Soluciones" antes del título, descripción recortada a 2
 * líneas con "..." (line-clamp), y botón "Más información" con el mismo
 * sweep que Cotizar/Nosotros, que lleva al detalle del servicio.
 */
export function ServiceCardFinal({ item }: { item: (typeof SOLUTIONS)[number] }) {
  return (
    // Sombra en azul oscuro de marca (brand-dark), no gris/negra: suave en
    // reposo y más marcada al hover.
    <div className="group relative aspect-4/5 overflow-hidden rounded-2xl text-white shadow-lg shadow-brand-dark/25 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-dark/45 sm:aspect-5/4 xl:aspect-4/5">
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
        // Mismo hover de imagen que el Modelo 3: zoom + giro leve.
        className="object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2"
      />
      {/* Mismo degradé que el Modelo 3: negro neutro, oscuro solo abajo
          (donde va el texto) y transparente arriba -- la foto se ve con sus
          colores reales, sin el tinte azul. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      {/* Contorno celeste que gira al hover (ver .spin-border en globals.css). */}
      <span className="spin-border" aria-hidden />

      {/* Ícono en la esquina superior izquierda, blanco sobre azul oscuro de
          marca (sólido); al hover pasa al azul principal. */}
      <span className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-brand-dark shadow-lg shadow-brand-dark/40 transition-colors duration-300 group-hover:bg-brand-primary">
        <Icon name={item.icon} className="icon-hop h-6 w-6 text-white" />
      </span>

      <div className="relative flex h-full flex-col justify-end p-6">
        {/* Badge de vidrio (mismo estilo que el badge del Hero). */}
        <span className="w-fit rounded-lg border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-md">
          Soluciones
        </span>
        <h3 className="mt-3 text-lg font-semibold leading-snug">{item.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/75">{item.description}</p>
        {/* w-full: mismo ancho que el título/descripción. Solo aparece al
            pasar el cursor (o al enfocar con teclado): se despliega
            (max-height) y entra con fade + subida. En pantallas táctiles
            (sin hover) queda siempre visible. */}
        <div className="mt-4 transition-all duration-300 ease-out [@media(hover:hover)]:mt-0 [@media(hover:hover)]:max-h-0 [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:pointer-events-auto [@media(hover:hover)]:group-hover:mt-4 [@media(hover:hover)]:group-hover:max-h-16 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:mt-4 [@media(hover:hover)]:group-focus-within:max-h-16 [@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-focus-within:opacity-100">
          <MoreInfoButton href={`/servicios/${item.slug}`} className="w-full px-3!" />
        </div>
      </div>
    </div>
  );
}
