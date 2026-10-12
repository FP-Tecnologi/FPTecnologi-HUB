'use client';
import { useEffect, useState, type ReactNode } from 'react';

// Cabecera fija que, al bajar, se compacta, se vuelve más sólida y gana una sombra suave.
export default function CabeceraFija({ children }: { children: ReactNode }) {
  const [bajo, setBajo] = useState(false);
  useEffect(() => {
    const f = () => setBajo(window.scrollY > 12);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  return (
    <header
      data-bajo={bajo}
      className="group/cab fixed inset-x-0 top-0 z-50 border-b border-line/50 bg-bg/60 backdrop-blur-md transition-[background-color,box-shadow,border-color] duration-300 data-[bajo=true]:border-line data-[bajo=true]:bg-bg/95 data-[bajo=true]:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
    >
      {children}
    </header>
  );
}
