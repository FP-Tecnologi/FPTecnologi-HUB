'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Entra con fade + subida al llegar al viewport; los hijos con data-r se escalonan.
export default function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = el.querySelectorAll('[data-r]');
    const ctx = gsap.context(() => {
      const objetivos = items.length ? items : [el];
      // Las transiciones CSS (hover) pelean con gsap y congelan el fade: se anulan mientras anima.
      objetivos.forEach((o) => ((o as HTMLElement).style.transition = 'none'));
      gsap.from(objetivos, {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12,
        onComplete: () => gsap.set(objetivos, { clearProps: 'all' }),
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
