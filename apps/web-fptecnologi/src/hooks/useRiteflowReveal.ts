'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/*
 * Animación de entrada del template Riteflow, portada del hook original
 * (useHomeV2BannerAnimation / la del AboutSection) -- simplificada: el
 * original esperaba un "preloader-active" en <html> que este sitio no
 * tiene, así que se saca esa parte (era solo para no arrancar la
 * animación mientras un preloader propio tapaba la pantalla). El resto
 * (timeline GSAP + ScrollTrigger por atributos data-*) es igual.
 *
 * BUG que hubo acá: `selectors` como array literal en cada render entraba
 * al array de dependencias del efecto -> el efecto se reiniciaba en cada
 * render (referencia nueva cada vez), mataba el ScrollTrigger antes de que
 * llegara a reproducirse, y el contenido quedaba con opacity:0 para
 * siempre (`gsap.set` inicial sin que el "to" corriera jamás) -- la home
 * se veía en blanco. Fix: correr una sola vez al montar + un fallback que
 * fuerza todo visible si el ScrollTrigger no llegó a disparar (recarga
 * lenta, layout shift, lo que sea) -- nunca debe quedar contenido oculto.
 *
 * Uso: cada elemento a animar lleva un data-attribute (data-title,
 * data-excerpt, etc.) dentro de un contenedor con containerSelector.
 */
export function useRiteflowReveal(containerSelector: string, selectors: string[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = document.querySelector<HTMLElement>(containerSelector);
    if (!container) return;

    const from = { y: 60, opacity: 0, filter: 'blur(12px)' };
    const to = { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' };

    const els = selectors
      .map((sel) => Array.from(container.querySelectorAll<HTMLElement>(sel)))
      .filter((list) => list.length > 0);
    const allEls = els.flat();

    allEls.forEach((el) => gsap.set(el, from));

    const tl = gsap.timeline({ paused: true });
    els.forEach((list, i) => {
      tl.fromTo(list, from, { ...to, stagger: 0.08 }, i === 0 ? 0 : '-=0.55');
    });

    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top 85%',
      end: 'top 40%',
      animation: tl,
      toggleActions: 'play none none none',
      invalidateOnRefresh: true,
    });

    // Red de seguridad: si por lo que sea el ScrollTrigger nunca disparó
    // (hero ya en viewport pero el cálculo de posición falló, etc.), forzar
    // todo visible -- nunca dejar contenido invisible de forma permanente.
    const fallback = window.setTimeout(() => {
      if (tl.progress() === 0) allEls.forEach((el) => gsap.set(el, to));
    }, 1500);

    return () => {
      window.clearTimeout(fallback);
      st.kill();
      tl.kill();
    };
  }, []);
}
