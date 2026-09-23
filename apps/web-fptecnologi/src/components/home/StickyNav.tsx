'use client';

import { useEffect, useState } from 'react';
import { Navbar9 } from './Navbar9';

// Después de bajar más o menos la altura del nav original del Hero -- ni
// bien empieza a scrollear (se sentía muy temprano) ni recién al terminar
// el hero (se sentía muy tarde, el usuario navega sin nav casi toda la
// primera pantalla).
const SCROLL_THRESHOLD = 140;

/*
 * El encabezado del Hero ES este componente: siempre montado en
 * position:fixed y siempre visible. Arriba del todo se ubica exactamente
 * donde va el nav dentro de la tarjeta del Hero (mismo padding p-3/md:p-5
 * que el wrapper del Hero, fondo transparente, tamaño normal) -- el Hero
 * solo reserva ese alto con un Navbar9 invisible. Al pasar
 * SCROLL_THRESHOLD, el mismo `<div>` se comprime: los bordes laterales
 * (left/right) se animan hacia el centro, gana fondo oscuro + esquinas
 * redondeadas y el Navbar9 pasa a `compact` (logo y padding más chicos,
 * también con transición). Así se ve como el mismo encabezado
 * achicándose, no uno nuevo apareciendo de la nada.
 *
 * Ancho comprimido: 64rem (72rem en 2xl) centrado, con un mínimo de
 * margen lateral -- expresado como left/right (max(...)) en vez de
 * max-width para que la transición sea continua desde el ancho completo.
 */
export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed z-50 transition-all duration-500 ease-in-out ${
        scrolled
          ? 'inset-x-6 top-4 md:inset-x-16 lg:inset-x-[max(6rem,calc((100%_-_64rem)/2))] 2xl:inset-x-[max(6rem,calc((100%_-_72rem)/2))]'
          : // 1px menos que el p-3/md:p-5 del Hero: compensa el borde (1px)
            // del div de adentro, así calza exacto con el hueco del nav.
            'inset-x-[11px] top-[11px] md:inset-x-[19px] md:top-[19px]'
      }`}
    >
      <div
        className={`border transition-all duration-500 ease-in-out ${
          scrolled
            ? 'rounded-2xl border-white/10 bg-ink/80 shadow-xl shadow-black/30 backdrop-blur-xl'
            : 'rounded-[1.25rem] border-transparent bg-transparent shadow-none md:rounded-[2.25rem]'
        }`}
      >
        <Navbar9 compact={scrolled} />
      </div>
    </div>
  );
}
