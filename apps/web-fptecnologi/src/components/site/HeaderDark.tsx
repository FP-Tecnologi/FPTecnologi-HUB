'use client';

import Image from 'next/image';
import { useState } from 'react';
import { DesktopNav, MobileNav } from './MainNav';
import { CartButton } from './CartButton';
import { CurrencyToggle } from './CurrencyToggle';
import { COTIZADOR_URL } from '@/lib/content';

/**
 * Header oscuro para páginas de Soluciones/informativas -- mismo layout de 3
 * zonas y los mismos links/submenús que `Header.tsx` (el real, blanco, para
 * Tienda/ecommerce), pero en vidrio oscuro para que combine con heros de
 * video o imagen oscura (mismo patrón ya probado en site9/Navbar9.tsx:
 * DesktopNav/MobileNav con tone="dark" + dropdownVariant="glass", logo con
 * filtro blanco vía brightness-0 invert).
 */
export function HeaderDark() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-6 py-3">
        <a href="#inicio" className="flex items-center gap-2">
          <Image src="/logo-fptecnologi.svg" alt="FPTecnologi & System" width={168} height={40} priority className="h-8 w-auto brightness-0 invert" />
        </a>

        <div className="hidden justify-center lg:flex">
          <DesktopNav tone="dark" dropdownVariant="glass" />
        </div>

        <div className="flex items-center gap-2 justify-self-end">
          <div className="hidden lg:block">
            <CurrencyToggle tone="dark" />
          </div>
          <CartButton tone="dark" />
          <div className="hidden lg:block">
            <a
              href={COTIZADOR_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/30 transition-transform hover:scale-[1.03] hover:bg-brand-dark"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M14 3v4h4M9 12h6M9 15.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              Cotizador
            </a>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 lg:hidden"
            aria-label="Abrir menú"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
              {open ? (
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-white/10 bg-black/70 px-6 py-4 backdrop-blur-xl lg:hidden">
          <MobileNav tone="dark" onNavigate={() => setOpen(false)} />
          <a
            href={COTIZADOR_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-center text-sm font-semibold text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M14 3v4h4M9 12h6M9 15.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            Cotizador
          </a>
        </div>
      )}
    </header>
  );
}
