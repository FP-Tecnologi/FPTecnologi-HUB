'use client';

import Image from 'next/image';
import { useState } from 'react';
import { NAV_LINKS } from '@/lib/nav';
import { COTIZADOR_URL } from '@/lib/content';
import { CartButton } from '@/components/site/CartButton';

/* Header estilo "tienda de relojería premium" (referencia): blanco, minimal,
   nav a la derecha del logo, buscador + cuenta + carrito. Buscador es solo
   visual (no hay backend de búsqueda) -- se aclara en el placeholder. */
export function Header10() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
        <a href="#inicio" className="flex items-center gap-2">
          <Image src="/logo-fptecnologi.svg" alt="FPTecnologi & System" width={150} height={36} className="h-7 w-auto" />
        </a>

        <nav className="hidden flex-1 items-center gap-7 text-sm text-ink/70 lg:flex" aria-label="Principal">
          {NAV_LINKS.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm text-ink/40 md:flex">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" /><path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          Buscar productos
        </div>

        <div className="flex items-center gap-3">
          <CartButton tone="light" />
          <a href={COTIZADOR_URL} target="_blank" rel="noreferrer" className="hidden rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark sm:inline-flex">
            Cotizar ahora
          </a>
          <button type="button" onClick={() => setOpen((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 lg:hidden" aria-label="Abrir menú" aria-expanded={open}>
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-ink">
              {open ? <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-black/5 bg-white p-4 lg:hidden">
          {NAV_LINKS.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-ink/80 hover:bg-black/5">
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
