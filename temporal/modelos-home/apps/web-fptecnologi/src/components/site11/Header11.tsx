'use client';

import Image from 'next/image';
import { useState } from 'react';
import { NAV_LINKS } from '@/lib/nav';
import { CartButton } from '@/components/site/CartButton';

/* Header oscuro con acento violeta (referencia: tienda gaming) -- buscador
   solo visual, sin backend de búsqueda (mismo criterio que Header10). */
export function Header11() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0b14]">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
        <a href="#inicio" className="flex items-center gap-2">
          <Image src="/logo-fptecnologi.svg" alt="FPTecnologi & System" width={150} height={36} className="h-7 w-auto brightness-0 invert" />
        </a>

        <nav className="hidden items-center gap-6 text-sm text-white/70 lg:flex" aria-label="Principal">
          {NAV_LINKS.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-violet-400">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden max-w-xs flex-1 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/40 md:flex">
          <input type="text" placeholder="Buscar productos" className="w-full bg-transparent text-white placeholder:text-white/40 focus:outline-none" disabled />
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" /><path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
        </div>

        <div className="flex items-center gap-3">
          <CartButton tone="dark" />
          <button type="button" onClick={() => setOpen((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 lg:hidden" aria-label="Abrir menú" aria-expanded={open}>
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
              {open ? <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-white/10 bg-[#0d0b14] p-4 lg:hidden">
          {NAV_LINKS.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/5">
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
