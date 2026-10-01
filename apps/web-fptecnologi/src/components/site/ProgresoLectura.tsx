'use client';

import { useEffect, useState } from 'react';

/* Barra fina de progreso de lectura, pegada arriba, para artículos largos. */
export function ProgresoLectura() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const art = document.getElementById('articulo');
      if (!art) return;
      const r = art.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setP(total <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / total)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent">
      <div className="h-full origin-left bg-gradient-to-r from-brand-primary to-brand-dark transition-[width] duration-150" style={{ width: `${p * 100}%` }} />
    </div>
  );
}
