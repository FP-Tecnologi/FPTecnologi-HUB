'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/*
 * Portado de useStaggerAnimation del template Riteflow -- anima en cascada
 * cada [data-sttr-card] dentro de un [data-sttr-wrapper], disparado al
 * entrar en viewport. Igual al original, sin la espera de "preloader-active"
 * (ver useRiteflowReveal.ts).
 */
export function useRiteflowStagger() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const wrappers = document.querySelectorAll<HTMLElement>('[data-sttr-wrapper]');
    const from = { y: 60, opacity: 0, filter: 'blur(12px)' };
    const to = { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, stagger: 0.1, ease: 'power3.out' };

    const triggers: ScrollTrigger[] = [];

    wrappers.forEach((wrapper) => {
      const cards = wrapper.querySelectorAll<HTMLElement>('[data-sttr-card]');
      if (!cards.length) return;
      cards.forEach((card) => gsap.set(card, from));
      const tl = gsap.timeline({ paused: true }).fromTo(cards, from, to);
      triggers.push(
        ScrollTrigger.create({
          trigger: wrapper,
          start: 'top 85%',
          animation: tl,
          toggleActions: 'play none none none',
        }),
      );
    });

    return () => triggers.forEach((t) => t.kill());
  }, []);
}
