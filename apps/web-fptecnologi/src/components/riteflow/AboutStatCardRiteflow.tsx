'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* Portado casi verbatim de AboutStatCard.tsx (plantilla Riteflow) -- conteo
   animado disparado por IntersectionObserver, sin GSAP. Recibe números
   reales de STATS (content.ts), no las cifras de la plantilla original. */
export function AboutStatCardRiteflow({ value, suffix, label, delay = 0 }: { value: number; suffix?: string; label: string; delay?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const animate = useCallback(() => {
    const duration = 1400;
    const start = Date.now();
    const step = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.floor(value * eased));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(value);
    };
    requestAnimationFrame(step);
  }, [value]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || hasAnimated) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          window.setTimeout(animate, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [hasAnimated, delay, animate]);

  return (
    <div ref={cardRef} className="flex flex-col gap-2 rounded-2xl bg-gradient-to-b from-[#7d76ff]/20 to-[#2f27b1]/20 p-5">
      <h3 className="text-3xl font-semibold lg:text-[32px]">
        <span className="text-white">{count.toLocaleString('es-PE')}</span>
        {suffix && <span className="text-[#a78bfa]"> {suffix}</span>}
      </h3>
      <p className="tracking-[0.1px] text-white/80">{label}</p>
    </div>
  );
}
