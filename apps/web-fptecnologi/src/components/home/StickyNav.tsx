'use client';

import { useEffect, useState } from 'react';
import { Navbar9 } from './Navbar9';

// Después de bajar más o menos la altura del nav original del Hero -- ni
// bien empieza a scrollear (se sentía muy temprano) ni recién al terminar
// el hero (se sentía muy tarde, el usuario navega sin nav casi toda la
// primera pantalla).
const SCROLL_THRESHOLD = 140;

/*
 * Barra de navegación fija que aparece al hacer scroll -- a diferencia del
 * <Navbar9/> de adentro del Hero (que vive en el flujo normal y se va con
 * el video al scrollear), esta es un componente aparte, siempre montado en
 * position:fixed.
 *
 * En vez de solo un fade/slide, el mismo `<div>` transiciona TODAS las
 * propiedades de golpe entre dos estados (por eso transition-all): arriba
 * del todo empieza pegado a los 3 bordes (inset-x-0 top-0, sin esquinas
 * redondeadas, invisible) -- exactamente encima del Navbar9 real del Hero,
 * así que no se nota que está ahí -- y al pasar SCROLL_THRESHOLD pasa a
 * inset-x-4/8 + top-4 + rounded-2xl + opacity-100. Como `left`/`right`/`top`
 * son animables, el resultado es que se ve como si el propio encabezado se
 * fuera angostando/encogiendo hacia el centro (no un fade suelto ya
 * angosto), y al volver arriba se ensancha de vuelta a su lugar original.
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
          ? 'inset-x-6 top-4 opacity-100 md:inset-x-16 lg:inset-x-24'
          : 'inset-x-0 top-0 opacity-0 pointer-events-none'
      }`}
      aria-hidden={!scrolled}
    >
      <div
        className={`mx-auto max-w-5xl border-white/10 bg-ink/80 shadow-black/30 backdrop-blur-xl transition-[border-radius,box-shadow] duration-500 ease-in-out ${
          scrolled ? 'rounded-2xl border shadow-xl' : 'rounded-none border-0 shadow-none'
        }`}
      >
        <Navbar9 compact />
      </div>
    </div>
  );
}
